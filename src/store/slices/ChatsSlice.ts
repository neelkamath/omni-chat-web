import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  Dictionary,
  Draft,
  PayloadAction,
} from '@reduxjs/toolkit';
import { FetchStatus, RootState } from '../store';
import { BlockedUsersSlice } from './BlockedUsersSlice';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { Bio, DateTime, GroupChatTitle, MessageText, Name, queryOrMutate, Username, Uuid } from '@neelkamath/omni-chat';

/** Stores every chat the user is in. Group chats don't store their participants in {@link GroupChat.users}. */
export namespace ChatsSlice {
  const sliceName = 'chats';

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
    readonly messageId: number;
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
    readonly firstName: Name;
    readonly lastName: Name;
    readonly emailAddress: string;
    readonly bio: Bio;
  }

  export interface SenderAccount {
    readonly username: Username;
    readonly userId: number;
  }

  export type GroupChatPublicity = 'INVITABLE' | 'NOT_INVITABLE' | 'PUBLIC';

  export interface PrivateChat extends Chat {
    readonly __typename: 'PrivateChat';
    readonly user: UserAccount;
  }

  export interface GroupChat extends Chat {
    readonly __typename: 'GroupChat';
    readonly title: GroupChatTitle;
    readonly publicity: GroupChatPublicity;
    readonly isBroadcast: boolean;
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

  async function readChats(): Promise<ReadChatsResult | undefined> {
    return await operateGraphQlApi(
      async () =>
        await queryOrMutate(
          httpApiConfig,
          {
            query: `
              query ReadChats {
                readChats {
                  edges {
                    node {
                      __typename
                      ... on Chat {
                        chatId
                        messages {
                          edges {
                            node {
                              __typename
                              sent
                              sender {
                                username
                                userId
                              }
                              messageId
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
                          firstName
                          lastName
                          emailAddress
                          bio
                        }
                      }
                      ... on GroupChat {
                        title
                        publicity
                        isBroadcast
                      }
                    }
                  }
                }
              }
            `,
          },
          Storage.readAccessToken()!,
        ),
    );
  }

  const adapter = createEntityAdapter<Chat>({ selectId: ({ chatId }) => chatId });

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    /** {@link fetchChats} status. */
    readonly status: FetchStatus;
    /** The IDs of private chats which were deleted because the user being chatted with deleted their account. */
    readonly deletedPrivateChatIdList: number[];
  }

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

  /** Indicates that the messages the {@link userId} sent in the {@link chatId} are to be removed. */
  export interface UserChatMessagesRemoval {
    readonly chatId: number;
    readonly userId: number;
  }

  export interface DeletedMessage {
    readonly chatId: number;
    readonly messageId: number;
  }

  export interface NewMessage {
    readonly __typename:
      | 'NewActionMessage'
      | 'NewAudioMessage'
      | 'NewDocMessage'
      | 'NewGroupChatInviteMessage'
      | 'NewPicMessage'
      | 'NewPollMessage'
      | 'NewTextMessage'
      | 'NewVideoMessage';
    readonly chatId: number;
    readonly messageId: number;
    readonly sent: DateTime;
    readonly sender: NewMessageSender;
    readonly state: MessageState;
  }

  export interface NewMessageSender {
    readonly userId: number;
    readonly username: Username;
  }

  export interface NewTextMessage extends NewMessage {
    readonly __typename: 'NewTextMessage';
    readonly textMessage: MessageText;
  }

  export interface NewActionMessage extends NewMessage {
    readonly __typename: 'NewActionMessage';
    readonly actionableMessage: ActionableMessage;
  }

  export interface ActionableMessage {
    readonly text: MessageText;
    readonly actions: MessageText[];
  }

  export interface NewPicMessage extends NewMessage {
    readonly __typename: 'NewPicMessage';
    readonly caption: MessageText;
  }

  export interface NewAudioMessage extends NewMessage {
    readonly __typename: 'NewAudioMessage';
  }

  export interface NewGroupChatInviteMessage extends NewMessage {
    readonly __typename: 'NewGroupChatInviteMessage';
    readonly inviteCode: Uuid;
  }

  export interface NewDocMessage extends NewMessage {
    readonly __typename: 'NewDocMessage';
  }

  export interface NewVideoMessage extends NewMessage {
    readonly __typename: 'NewVideoMessage';
  }

  export interface NewPollMessage extends NewMessage {
    readonly __typename: 'NewPollMessage';
    readonly poll: Poll;
  }

  export interface Poll {
    readonly title: MessageText;
    readonly options: PollOption[];
  }

  export interface PollOption {
    readonly option: MessageText;
    readonly votes: VoterAccount[];
  }

  export interface VoterAccount {
    readonly userId: number;
  }

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ status: 'IDLE', fetching: [], deletedPrivateChatIdList: [] }) as State,
    reducers: {
      removeOne: adapter.removeOne,
      /** If there's a private chat with the specified user ID, then it'll be removed. */
      removePrivateChat: (state, { payload }: PayloadAction<number>) => {
        const chat = Object.values(state.entities).find(
          (entity) => entity?.__typename === 'PrivateChat' && (entity as PrivateChat).user.userId === payload,
        );
        if (chat !== undefined) {
          state.deletedPrivateChatIdList.push(chat.chatId);
          adapter.removeOne(state, chat.chatId);
        }
      },
      updateAccount: (state, { payload }: PayloadAction<UpdatedAccount>) => {
        Object.values(state.entities).forEach((entity) => {
          const node = entity?.messages.edges[0]?.node;
          if (payload.userId === node?.sender.userId) node.sender = payload;
          if (entity?.__typename === 'PrivateChat' && payload.userId === (entity as PrivateChat).user.userId)
            (entity as Draft<PrivateChat>).user = payload;
        });
      },
      deleteMessage: (state, { payload }: PayloadAction<DeletedMessage>) => {
        const messages = state.entities[payload.chatId]?.messages;
        if (messages !== undefined)
          messages.edges = messages.edges.filter(({ node }) => node.messageId !== payload.messageId);
      },
      removeUserChatMessages: (state, { payload }: PayloadAction<UserChatMessagesRemoval>) => {
        const messages = state.entities[payload.chatId]?.messages;
        if (messages !== undefined)
          messages.edges = messages.edges.filter(({ node }) => node.sender.userId !== payload.userId);
      },
      addMessage: (state, { payload }: PayloadAction<NewMessage>) => {
        const node: any = {
          __typename: '',
          sent: payload.sent,
          sender: payload.sender,
          state: payload.state,
          messageId: payload.messageId,
        };
        switch (payload.__typename) {
          case 'NewTextMessage':
            node.__typename = 'TextMessage';
            node.textMessage = (payload as NewTextMessage).textMessage;
            break;
          case 'NewActionMessage':
            node.__typename = 'ActionMessage';
            node.actionableMessage = (payload as NewActionMessage).actionableMessage;
            break;
          case 'NewPicMessage':
            node.__typename = 'PicMessage';
            node.caption = (payload as NewPicMessage).caption;
            break;
          case 'NewPollMessage':
            node.__typename = 'PollMessage';
            node.poll = (payload as NewPollMessage).poll;
            break;
          case 'NewAudioMessage':
            node.__typename = 'AudioMessage';
            break;
          case 'NewDocMessage':
            node.__typename = 'DocMessage';
            break;
          case 'NewGroupChatInviteMessage':
            node.__typename = 'GroupChatInviteMessage';
            node.inviteCode = (payload as NewGroupChatInviteMessage).inviteCode;
            break;
          case 'NewVideoMessage':
            node.__typename = 'VideoMessage';
        }
        state.entities[payload.chatId]?.messages.edges.push({ node });
      },
    },
    extraReducers: (builder) => {
      builder
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

  export const {
    removeOne,
    updateAccount,
    removePrivateChat,
    deleteMessage,
    removeUserChatMessages,
    addMessage,
  } = slice.actions;

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

  export const selectChat = createSelector(
    [(state: RootState) => state.chats.entities, (_: RootState, chatId: number) => chatId],
    (chats: Dictionary<Chat>, chatId: number) => chats[chatId],
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
    (chats: Dictionary<Chat>, chatId: number) => {
      const edges = chats[chatId]?.messages.edges;
      return edges === undefined ? undefined : edges[edges.length - 1]?.node;
    },
  );

  /** Whether the specified private chat belongs to a user who deleted their account, and therefore deleted the chat. */
  export const selectIsDeletedPrivateChat = createSelector(
    [(state: RootState) => state.chats.deletedPrivateChatIdList, (_: RootState, chatId: number) => chatId],
    (chatIdList: number[], chatId: number) => chatIdList.includes(chatId),
  );
}
