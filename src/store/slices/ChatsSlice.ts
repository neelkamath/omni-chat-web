import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  Dictionary,
  PayloadAction,
} from '@reduxjs/toolkit';
import { FetchStatus, RootState } from '../store';
import { BlockedUsersSlice } from './BlockedUsersSlice';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { Bio, DateTime, GroupChatTitle, MessageText, Name, queryOrMutate, Username } from '@neelkamath/omni-chat';

/**
 * Stores every chat the user is in. Only the last message sent in ({@link Chat.messages}) is stored. Group chats don't
 * store their participants in {@link GroupChat.users}.
 */
export namespace ChatsSlice {
  const sliceName = 'chats';

  async function operateReadChat(id: number): Promise<Chat | undefined> {
    const result = await readChat(id);
    return result?.readChat.__typename === 'InvalidChatId' ? undefined : result?.readChat;
  }

  export interface Chat {
    readonly __typename: 'PrivateChat' | 'GroupChat';
    readonly chatId: number;
    readonly messages: MessagesConnection;
  }

  export interface MessagesConnection {
    readonly edges: MessageEdge[];
  }

  export interface MessageEdge {
    readonly node: Message;
  }

  export interface Message {
    readonly __typename:
      | 'TextMessage'
      | 'ActionMessage'
      | 'PicMessage'
      | 'PollMessage'
      | 'AudioMessage'
      | 'DocMessage'
      | 'GroupChatInviteMessage'
      | 'VideoMessage';
    readonly sent: DateTime;
    readonly sender: SenderAccount;
    readonly state: MessageState;
  }

  export type MessageState = 'SENT' | 'DELIVERED' | 'READ';

  export interface TextMessage extends Message {
    readonly __typename: 'TextMessage';
    readonly textMessage: MessageText;
  }

  export interface ActionMessage extends Message {
    readonly __typename: 'ActionMessage';
    readonly actionableMessage: ActionableMessage;
  }

  export interface ActionableMessage {
    readonly text: MessageText;
  }

  export interface PicMessage extends Message {
    readonly caption: MessageText;
  }

  export interface PollMessage extends Message {
    readonly poll: Poll;
  }

  export interface Poll {
    readonly title: MessageText;
  }

  export interface UserAccount {
    readonly username: Username;
    readonly userId: number;
  }

  export interface SenderAccount {
    readonly username: Username;
    readonly userId: number;
  }

  export interface PrivateChat extends Chat {
    readonly __typename: 'PrivateChat';
    readonly user: UserAccount;
  }

  export interface GroupChat extends Chat {
    readonly __typename: 'GroupChat';
    readonly title: GroupChatTitle;
  }

  interface InvalidChatId {
    readonly __typename: 'InvalidChatId';
  }

  interface ReadChatResult {
    readonly readChat: PrivateChat | GroupChat | InvalidChatId;
  }

  const chatFragment = `
    __typename
    ... on Chat {
      chatId
      messages(last: $last) {
        edges {
          node {
            __typename
            sent
            sender {
              username
              userId
            }
            ... on TextMessage {
              textMessage
            }
            ... on ActionMessage {
              actionableMessage {
                text
              }
            }
            ... on PicMessage {
              caption
            }
            ... on PollMessage {
              poll {
                title
              }
            }
          }
        }
      }
    }
    ... on PrivateChat {
      user {
        userId
        username
      }
    }
    ... on GroupChat {
      title
    }
  `;

  async function readChat(id: number): Promise<ReadChatResult | undefined> {
    return await operateGraphQlApi(
      async () =>
        await queryOrMutate(
          httpApiConfig,
          {
            query: `
              query ReadChat($id: Int!, $last: Int) {
                readChat(id: $id) {
                  ${chatFragment}
                }
              }
            `,
            variables: { id, last: 1 },
          },
          Storage.readAccessToken()!,
        ),
    );
  }

  async function operateReadChats(): Promise<ChatsConnection | undefined> {
    const result = await readChats();
    return result?.readChats;
  }

  interface ChatsConnection {
    readonly edges: ChatEdge[];
  }

  interface ChatEdge {
    readonly node: Chat;
  }

  interface ReadChatsResult {
    readonly readChats: ChatsConnection;
  }

  // TODO: Only retrieve the first 15.
  async function readChats(): Promise<ReadChatsResult | undefined> {
    return await operateGraphQlApi(
      async () =>
        await queryOrMutate(
          httpApiConfig,
          {
            query: `
              query ReadChats($last: Int) {
                readChats {
                  edges {
                    node {
                      ${chatFragment}
                    }
                  }
                }
              }
            `,
            variables: { last: 1 },
          },
          Storage.readAccessToken()!,
        ),
    );
  }

  // TODO: Test once chat messages are implemented.
  const adapter = createEntityAdapter<Chat>({
    selectId: ({ chatId }) => chatId,
    sortComparer: (a, b) => {
      const readSent = (chat: Chat) => {
        const sent = chat.messages.edges[0]?.node.sent;
        return sent === undefined ? undefined : Date.parse(sent);
      };
      const aLast = readSent(a);
      const bLast = readSent(b);
      if (aLast === undefined && bLast === undefined) return 0;
      if (aLast === undefined) return 1;
      if (bLast === undefined) return -1;
      if (aLast < bLast) return -1;
      if (aLast === bLast) return 0;
      return 1;
    },
  });

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    /** {@link fetchChats} status. */
    readonly status: FetchStatus;
    /** The IDs of chats currently being fetched via {@link fetchChat}. */
    readonly fetching: number[];
    /** The IDs of private chats which were deleted because the user being chatted with deleted their account. */
    readonly deletePrivateChatIdList: number[];
  }

  /** Fetches/updates the specified chat. */
  export const fetchChat = createAsyncThunk(`${sliceName}/fetchChat`, operateReadChat, {
    condition: (id, { getState }) => {
      const { chats } = getState() as { chats: State };
      return chats.entities[id] === undefined && !chats.fetching.includes(id);
    },
  });

  export const fetchChats = createAsyncThunk(`${sliceName}/fetchChats`, operateReadChats, {
    condition: (_, { getState }) => {
      const { chats } = getState() as { chats: State };
      return chats.status === 'IDLE';
    },
  });

  export interface UpdatedAccount {
    readonly userId: number;
    readonly username: Username;
    readonly emailAddress: string;
    readonly firstName: Name;
    readonly lastName: Name;
    readonly bio: Bio;
  }

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ status: 'IDLE', fetching: [], deletePrivateChatIdList: [] }) as State,
    reducers: {
      removeOne: adapter.removeOne,
      /** If there's a private chat with the specified user ID, then it'll be removed. */
      removePrivateChat: (state, { payload }: PayloadAction<number>) => {
        const chat = Object.values(state.entities).find(
          (entity) => entity?.__typename === 'PrivateChat' && (entity as PrivateChat).user.userId === payload,
        );
        if (chat !== undefined) {
          state.deletePrivateChatIdList.push(chat.chatId);
          adapter.removeOne(state, chat.chatId);
        }
      },
      // TODO: Test once chat messages are implemented.
      updateAccount: (state, { payload }: PayloadAction<UpdatedAccount>) => {
        Object.values(state.entities).forEach((entity) => {
          const node = entity?.messages.edges[0]?.node;
          if (payload.username === node?.sender.username) node.sender = payload;
        });
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchChat.pending, (state, { meta }) => {
          state.fetching.push(meta.arg);
        })
        .addCase(fetchChat.rejected, (state, { meta }) => {
          state.fetching = state.fetching.filter((id) => id !== meta.arg);
        })
        .addCase(fetchChat.fulfilled, (state, { meta, payload }) => {
          state.fetching = state.fetching.filter((id) => id !== meta.arg);
          if (payload !== undefined) adapter.upsertOne(state, payload);
        })
        .addCase(fetchChats.fulfilled, (state, { payload }) => {
          state.status = 'LOADED';
          if (payload !== undefined)
            adapter.upsertMany(
              state,
              payload.edges.map(({ node }) => node),
            );
        })
        .addCase(fetchChats.rejected, (state) => {
          state.status = 'IDLE';
        })
        .addCase(fetchChats.pending, (state) => {
          state.status = 'LOADING';
        });
    },
  });

  export const { reducer } = slice;

  export const { removeOne, updateAccount, removePrivateChat } = slice.actions;

  const { selectAll } = adapter.getSelectors((state: RootState) => state.chats);

  /** Selects every chat the user is in excluding private chats with blocked users. */
  export const selectChats = createSelector(
    (state: RootState) => state,
    (state: RootState) => {
      return selectAll(state).filter((chat) => {
        if (chat.__typename === 'GroupChat') return true;
        const userId = (chat as PrivateChat).user.userId;
        return !BlockedUsersSlice.selectIsBlocked(state, userId);
      });
    },
  );

  /** Whether the chats have been fetched. */
  export const selectIsLoaded = createSelector(
    (state: RootState) => state.chats.status,
    (status: FetchStatus) => status === 'LOADED',
  );

  /**
   * If the specified chat has been fetched, and it has a last message, it'll be selected. Otherwise, `undefined` will
   * be selected.
   */
  export const selectLastMessage = createSelector(
    [(state: RootState) => state.chats.entities, (_: RootState, chatId: number) => chatId],
    (chats: Dictionary<Chat>, chatId: number) => chats[chatId]?.messages.edges[0]?.node,
  );

  /** Whether the specified private chat belongs to a user who deleted their account, and therefore deleted the chat. */
  export const selectIsDeletedPrivateChat = createSelector(
    [(state: RootState) => state.chats.deletePrivateChatIdList, (_: RootState, chatId: number) => chatId],
    (chatIdList: number[], chatId: number) => chatIdList.includes(chatId),
  );
}
