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
import {
  DateTime,
  GroupChatDescription,
  GroupChatPublicity,
  GroupChatTitle,
  MessageText,
  queryOrMutate,
  Uuid,
} from '@neelkamath/omni-chat';

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
    readonly isForwarded: boolean;
    readonly sent: DateTime;
    readonly sender: SenderAccount;
    readonly messageId: number;
  }

  export interface TextMessage extends Message {
    readonly __typename: 'TextMessage';
    readonly textMessage: MessageText;
  }

  export interface GroupChatInviteMessage extends Message {
    readonly __typename: 'GroupChatInviteMessage';
    readonly inviteCode: Uuid | null;
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

  export interface UserAccount {
    readonly userId: number;
  }

  export interface SenderAccount {
    readonly userId: number;
  }

  export interface PrivateChat extends Chat {
    readonly __typename: 'PrivateChat';
    readonly user: UserAccount;
  }

  export interface GroupChat extends Chat {
    readonly __typename: 'GroupChat';
    readonly title: GroupChatTitle;
    readonly description: GroupChatDescription;
    readonly publicity: GroupChatPublicity;
    readonly isBroadcast: boolean;
    readonly adminIdList: number[];
    readonly users: GroupChatAccountsConnection;
  }

  export interface GroupChatAccountsConnection {
    readonly edges: GroupChatAccountEdge[];
  }

  export interface GroupChatAccountEdge {
    readonly node: GroupChatUserAccount;
  }

  export interface GroupChatUserAccount {
    readonly userId: number;
  }

  async function operateReadChats(): Promise<ChatsConnection | undefined> {
    const response = await readChats();
    return response?.readChats;
  }

  async function operateReadChat(id: number): Promise<PrivateChat | GroupChat | undefined> {
    const response = await readChat(id);
    switch (response?.readChat.__typename) {
      case 'GroupChat':
      case 'PrivateChat':
        return response.readChat;
      case 'InvalidChatId':
      case undefined:
        return undefined;
    }
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

  const READ_CHAT_FRAGMENT = `
    __typename
    ... on Chat {
      chatId
      messages {
        edges {
          node {
            __typename
            sent
            isForwarded
            sender {
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
            ... on GroupChatInviteMessage {
              inviteCode
            }
            ... on PollMessage {
              poll {
                question
                options {
                  option
                  votes {
                    userId
                  }
                }
              }
            }
          }
        }
      }
    }
    ... on PrivateChat {
      user {
        userId
      }
    }
    ... on GroupChat {
      title
      description
      publicity
      isBroadcast
      adminIdList
      users {
        edges {
          node {
            userId
          }
        }
      }
    }
  `;

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
                      ${READ_CHAT_FRAGMENT}
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

  interface InvalidChatId {
    readonly __typename: 'InvalidChatId';
  }

  interface ReadChatResult {
    readonly readChat: PrivateChat | GroupChat | InvalidChatId;
  }

  async function readChat(id: number): Promise<ReadChatResult | undefined> {
    return await operateGraphQlApi(
      async () =>
        await queryOrMutate(
          httpApiConfig,
          {
            query: `
              query ReadChat($id: Int!) {
                readChat(id: $id) {
                  ${READ_CHAT_FRAGMENT}
                }
              }
            `,
            variables: { id },
          },
          Storage.readAccessToken()!,
        ),
    );
  }

  const adapter = createEntityAdapter<Chat>({ selectId: ({ chatId }) => chatId });

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    /** {@link fetchChats} status. */
    readonly status: FetchStatus;
    /** The IDs of chats currently being fetched by calls to {@link fetchChat}. */
    readonly fetching: number[];
  }

  export const fetchChats = createAsyncThunk(`${sliceName}/fetchChats`, operateReadChats, {
    condition: (_, { getState }) => {
      const { chats } = getState() as { chats: State };
      return chats.status === 'IDLE';
    },
  });

  export const fetchChat = createAsyncThunk(`${sliceName}/fetchChat`, operateReadChat, {
    condition: (chatId, { getState }) => {
      const { chats } = getState() as { chats: State };
      return chats.entities[chatId] === undefined && !chats.fetching.includes(chatId);
    },
  });

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
    readonly isForwarded: boolean;
    readonly messageId: number;
    readonly sent: DateTime;
    readonly sender: NewMessageSender;
  }

  export interface NewMessageSender {
    readonly userId: number;
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
    readonly inviteCode: Uuid | null;
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
    readonly question: MessageText;
    readonly options: PollOption[];
  }

  export interface PollOption {
    readonly option: MessageText;
    readonly votes: VoterAccount[];
  }

  export interface VoterAccount {
    readonly userId: number;
  }

  interface UpdatedGroupChat {
    readonly chatId: number;
    readonly title: GroupChatTitle | null;
    readonly description: GroupChatDescription | null;
    readonly newUsers: UpdatedGroupChatAccount[] | null;
    readonly removedUsers: UpdatedGroupChatAccount[] | null;
    readonly adminIdList: number[] | null;
    readonly isBroadcast: boolean | null;
    readonly publicity: GroupChatPublicity | null;
  }

  interface UpdatedPollMessage {
    readonly chatId: number;
    readonly messageId: number;
    readonly poll: Poll;
  }

  interface UpdatedGroupChatAccount {
    readonly userId: number;
  }

  function reduceUpdateGroupChat(state: Draft<State>, { payload }: PayloadAction<UpdatedGroupChat>): State | void {
    const chat = state.entities[payload.chatId] as Draft<GroupChat> | undefined;
    if (chat === undefined) return;
    if (payload.adminIdList !== null) chat.adminIdList = payload.adminIdList;
    if (payload.description !== null) chat.description = payload.description;
    if (payload.title !== null) chat.title = payload.title;
    if (payload.newUsers !== null) {
      const nodes = payload.newUsers.map((user) => ({ node: user }));
      chat.users.edges.push(...nodes);
    }
    if (payload.removedUsers !== null) {
      const removedUsers = payload.removedUsers.map(({ userId }) => userId);
      chat.users.edges = chat.users.edges.filter(({ node }) => !removedUsers.includes(node.userId));
    }
    if (payload.isBroadcast !== null) chat.isBroadcast = payload.isBroadcast;
    if (payload.publicity !== null) chat.publicity = payload.publicity;
  }

  /** If there's a private chat with the specified user ID, then it'll be removed. */
  function reduceRemovePrivateChat(state: Draft<State>, { payload }: PayloadAction<number>): State | void {
    const chat = Object.values(state.entities).find(
      (entity) => entity?.__typename === 'PrivateChat' && (entity as PrivateChat).user.userId === payload,
    );
    if (chat === undefined) return;
    adapter.removeOne(state, chat.chatId);
  }

  function reduceUpdatePoll(state: Draft<State>, { payload }: PayloadAction<UpdatedPollMessage>): State | void {
    const messages = state.entities[payload.chatId]?.messages;
    if (messages === undefined) return;
    messages.edges = messages.edges.map((edge) => {
      if (edge.node.messageId === payload.messageId) (edge.node as Draft<PollMessage>).poll = payload.poll;
      return edge;
    });
  }

  function reduceDeleteMessage(state: Draft<State>, { payload }: PayloadAction<DeletedMessage>): State | void {
    const messages = state.entities[payload.chatId]?.messages;
    if (messages !== undefined)
      messages.edges = messages.edges.filter(({ node }) => node.messageId !== payload.messageId);
  }

  function reduceRemoveUserChatMessages(
    state: Draft<State>,
    { payload }: PayloadAction<UserChatMessagesRemoval>,
  ): State | void {
    const messages = state.entities[payload.chatId]?.messages;
    if (messages !== undefined)
      messages.edges = messages.edges.filter(({ node }) => node.sender.userId !== payload.userId);
  }

  /** Adds the message to the chat if it's in the store. Use {@link fetchChat} for adding a message to a new chat. */
  function reduceAddMessage(state: Draft<State>, { payload }: PayloadAction<NewMessage>): State | void {
    const node: any = {
      sent: payload.sent,
      sender: payload.sender,
      messageId: payload.messageId,
      isForwarded: payload.isForwarded,
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
    const messages = state.entities[payload.chatId]?.messages;
    if (messages === undefined) return;
    let index = 0;
    while (index < messages.edges.length && node.messageId > messages.edges[index]!.node.messageId) index++;
    messages.edges.splice(index, 0, { node });
  }

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ status: 'IDLE', fetching: [] }) as State,
    reducers: {
      removeOne: adapter.removeOne,
      removePrivateChat: reduceRemovePrivateChat,
      updateGroupChat: reduceUpdateGroupChat,
      deleteMessage: reduceDeleteMessage,
      removeUserChatMessages: reduceRemoveUserChatMessages,
      addMessage: reduceAddMessage,
      updatePoll: reduceUpdatePoll,
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchChats.fulfilled, (state, { payload }) => {
          state.status = 'LOADED';
          if (payload !== undefined) {
            const nodes = payload.edges.map(({ node }) => node);
            adapter.upsertMany(state, nodes);
          }
        })
        .addCase(fetchChats.rejected, (state) => {
          state.status = 'IDLE';
        })
        .addCase(fetchChats.pending, (state) => {
          state.status = 'LOADING';
        })
        .addCase(fetchChat.fulfilled, (state, { payload, meta }) => {
          state.fetching = state.fetching.filter((chatId) => chatId !== meta.arg);
          if (payload !== undefined) adapter.upsertOne(state, payload);
        })
        .addCase(fetchChat.rejected, (state, { meta }) => {
          state.fetching = state.fetching.filter((chatId) => chatId !== meta.arg);
        })
        .addCase(fetchChat.pending, (state, { meta }) => {
          state.fetching.push(meta.arg);
        });
    },
  });

  export const { reducer } = slice;

  export const {
    removeOne,
    removePrivateChat,
    updateGroupChat,
    deleteMessage,
    removeUserChatMessages,
    addMessage,
    updatePoll,
  } = slice.actions;

  const { selectAll } = adapter.getSelectors((state: RootState) => state.chats);

  /** Selects every chat the user is in excluding private chats with blocked users. */
  export const selectChats = createSelector(
    (state: RootState) => {
      return selectAll(state).filter((chat) => {
        if (chat.__typename === 'GroupChat') return true;
        const userId = (chat as PrivateChat).user.userId;
        return !BlockedUsersSlice.selectIsBlocked(state, userId);
      });
    },
    (chats: Chat[]) => chats,
  );

  /** Returns the specified group chat, or `undefined` if the chat hasn't been fetched. */
  const selectGroupChat = createSelector(
    (state: RootState) => state.chats.entities,
    (_: RootState, chatId: number) => chatId,
    (chats: Dictionary<Chat>, chatId: number) => chats[chatId] as GroupChat | undefined,
  );

  /** Returns the title of the specified group chat, or `undefined` if the chat hasn't been fetched. */
  export const selectGroupChatTitle = createSelector(selectGroupChat, (chat: GroupChat | undefined) => chat?.title);

  /** Returns the title of the specified group chat, or `undefined` if the chat hasn't been fetched. */
  export const selectGroupChatDescription = createSelector(
    selectGroupChat,
    (chat: GroupChat | undefined) => chat?.description,
  );

  /** Returns the specified chat, or `undefined` if it hasn't been fetched. */
  export const selectChat = createSelector(
    (state: RootState) => state.chats.entities,
    (_: RootState, chatId: number) => chatId,
    (chats: Dictionary<Chat>, chatId: number) => chats[chatId],
  );

  /**
   * Returns whether the specified user is an admin of the specified group chat, or `undefined` if the chat hasn't been
   * fetched.
   */
  export const selectIsAdmin = createSelector(
    (state: RootState) => state.chats.entities,
    (_: RootState, chatId: number) => chatId,
    (_state: RootState, _chatId: number, userId: number) => userId,
    (chats: Dictionary<Chat>, chatId: number, userId: number) =>
      (chats[chatId] as GroupChat | undefined)?.adminIdList.includes(userId),
  );

  /** Returns whether the specified group chat is a broadcast chat, or `undefined` if the chat hasn't been fetched. */
  export const selectIsBroadcast = createSelector(selectGroupChat, (chat: GroupChat | undefined) => chat?.isBroadcast);

  /** Returns the publicity of the specified group chat, or `undefined` if the chat hasn't been fetched.. */
  export const selectPublicity = createSelector(selectGroupChat, (chat: GroupChat | undefined) => chat?.publicity);

  /** Whether the chats have been fetched. */
  export const selectIsLoaded = createSelector(
    (state: RootState) => state.chats.status === 'LOADED',
    (isLoaded: boolean) => isLoaded,
  );

  /**
   * If the specified chat has been fetched, and it has a last message, it'll be selected. Otherwise, `undefined` will
   * be selected.
   */
  export const selectLastMessage = createSelector(
    (state: RootState) => state.chats.entities,
    (_: RootState, chatId: number) => chatId,
    (chats: Dictionary<Chat>, chatId: number) => {
      const edges = chats[chatId]?.messages.edges;
      return edges === undefined ? undefined : edges[edges.length - 1]?.node;
    },
  );

  /** Returns the ID of each participant in the specified group chat, or `undefined` if the chat hasn't been fetched. */
  export const selectParticipants = createSelector(selectGroupChat, (chat: GroupChat | undefined) =>
    chat?.users.edges.map(({ node }) => node.userId),
  );

  /** Returns the IDs of each admin in the specified group chat, or `undefined` if the chat hasn't been fetched. */
  export const selectAdminIdList = createSelector(selectGroupChat, (chat: GroupChat | undefined) => chat?.adminIdList);

  /**
   * Returns the IDs of users in private chats with the signed in user excluding the signed in user, or `undefined` if
   * the chats haven't been fetched.
   */
  export const selectPrivateChatUsers = createSelector(
    (state: RootState) =>
      selectAll(state)
        .filter((chat) => chat.__typename === 'PrivateChat')
        .map((chat) => (chat as PrivateChat).user.userId),
    (userIdList: number[] | undefined) => userIdList,
  );
}
