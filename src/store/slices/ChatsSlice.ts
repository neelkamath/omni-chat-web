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
  Bio,
  DateTime,
  GroupChatDescription,
  GroupChatTitle,
  MessageText,
  Name,
  queryOrMutate,
  Username,
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
    readonly username: Username;
    readonly emailAddress: string;
    readonly firstName: Name;
    readonly lastName: Name;
    readonly bio: Bio;
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
        username
        firstName
        lastName
        emailAddress
        bio
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
            username
            emailAddress
            firstName
            lastName
            bio
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
    /** The IDs of private chats which were deleted because the user being chatted with deleted their account. */
    readonly deletedPrivateChatIdList: number[];
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

  interface UpdatedGroupChatAccount {
    readonly userId: number;
    readonly username: Username;
    readonly emailAddress: string;
    readonly firstName: Name;
    readonly lastName: Name;
    readonly bio: Bio;
  }

  interface ExitedUsers {
    readonly chatId: number;
    readonly userIdList: number[];
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
    if (chat !== undefined) {
      state.deletedPrivateChatIdList.push(chat.chatId);
      adapter.removeOne(state, chat.chatId);
    }
  }

  function reduceUpdateAccount(state: Draft<State>, { payload }: PayloadAction<UpdatedAccount>): State | void {
    Object.values(state.entities).forEach((entity) => {
      const node = entity?.messages.edges[0]?.node;
      if (payload.userId === node?.sender.userId) node.sender = payload;
      if (entity?.__typename === 'PrivateChat' && payload.userId === (entity as PrivateChat).user.userId)
        (entity as Draft<PrivateChat>).user = payload;
    });
  }

  function reduceRemoveGroupChatUsers(state: Draft<State>, { payload }: PayloadAction<ExitedUsers>): State | void {
    Object.values(state.entities).forEach((entity) => {
      if (entity === undefined || entity.chatId !== payload.chatId) return;
      const { chatId, users } = entity as Draft<GroupChat>;
      if (chatId === payload.chatId)
        users.edges = users.edges.filter(({ node }) => !payload.userIdList.includes(node.userId));
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

  function reduceAddMessage(state: Draft<State>, { payload }: PayloadAction<NewMessage>): State | void {
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
  }

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ status: 'IDLE', fetching: [], deletedPrivateChatIdList: [] }) as State,
    reducers: {
      removeOne: adapter.removeOne,
      removePrivateChat: reduceRemovePrivateChat,
      updateGroupChat: reduceUpdateGroupChat,
      updateAccount: reduceUpdateAccount,
      deleteMessage: reduceDeleteMessage,
      removeUserChatMessages: reduceRemoveUserChatMessages,
      addMessage: reduceAddMessage,
      removeGroupChatUsers: reduceRemoveGroupChatUsers,
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
    updateAccount,
    removePrivateChat,
    updateGroupChat,
    deleteMessage,
    removeUserChatMessages,
    addMessage,
    removeGroupChatUsers,
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

  /** Returns the specified group chat, or `undefined` if the chat hasn't been fetched. */
  const selectGroupChat = createSelector(
    [(state: RootState) => state.chats.entities, (_: RootState, chatId: number) => chatId],
    (chats: Dictionary<Chat>, chatId: number) => chats[chatId] as GroupChat | undefined,
  );

  /** Returns the title of the specified group chat, or `undefined` if the chat hasn't been fetched. */
  export const selectGroupChatTitle = createSelector([selectGroupChat], (chat: GroupChat | undefined) => chat?.title);

  /** Returns the title of the specified group chat, or `undefined` if the chat hasn't been fetched. */
  export const selectGroupChatDescription = createSelector(
    [selectGroupChat],
    (chat: GroupChat | undefined) => chat?.description,
  );

  /** Returns the specified chat, or `undefined` if it hasn't been fetched. */
  export const selectChat = createSelector(
    [(state: RootState) => state.chats.entities, (_: RootState, chatId: number) => chatId],
    (chats: Dictionary<Chat>, chatId: number) => chats[chatId],
  );

  /**
   * Returns whether the specified user is an admin of the specified group chat, or `undefined` if the chat hasn't been
   * fetched.
   */
  export const selectIsAdmin = createSelector(
    [
      (state: RootState) => state.chats.entities,
      (_: RootState, chatId: number) => chatId,
      (_state: RootState, _chatId: number, userId: number) => userId,
    ],
    (chats: Dictionary<Chat>, chatId: number, userId: number) =>
      (chats[chatId] as GroupChat | undefined)?.adminIdList.includes(userId),
  );

  /** Returns whether the specified group chat is a broadcast chat, or `undefined` if the chat hasn't been fetched. */
  export const selectIsBroadcast = createSelector(
    [selectGroupChat],
    (chat: GroupChat | undefined) => chat?.isBroadcast,
  );

  /** Returns the publicity of the specified group chat, or `undefined` if the chat hasn't been fetched.. */
  export const selectPublicity = createSelector([selectGroupChat], (chat: GroupChat | undefined) => chat?.publicity);

  /** Whether the chats have been fetched. */
  export const selectIsLoaded = createSelector(
    (state: RootState) => state.chats.status,
    (status: FetchStatus) => status === 'LOADED',
  );

  /**
   * If the specified chat has been fetched, and it has a last message, it'll be selected. Otherwise, `undefined` will
   * be selected.
   */
  export const selectLastMessage = createSelector([selectChat], (chat: Chat | undefined) => {
    const edges = chat?.messages.edges;
    return edges === undefined ? undefined : edges[edges.length - 1]?.node;
  });

  /** Returns the IDs of users in the specified group chat, or `undefined` if the chat hasn't been fetched. */
  export const selectParticipantIdList = createSelector([selectGroupChat], (chat: GroupChat | undefined) =>
    chat?.users.edges.map(({ node }) => node.userId),
  );

  /** Returns the specified group chat's participants, or `undefined` if the chat hasn't been fetched. */
  export const selectParticipants = createSelector([selectGroupChat], (chat: GroupChat | undefined) =>
    chat?.users.edges.map(({ node }) => node),
  );

  /** Returns the IDs of each admin in the specified group chat, or `undefined` if the chat hasn't been fetched. */
  export const selectAdminIdList = createSelector(
    [selectGroupChat],
    (chat: GroupChat | undefined) => chat?.adminIdList,
  );

  /** Whether the specified private chat belongs to a user who deleted their account, and therefore deleted the chat. */
  export const selectIsDeletedPrivateChat = createSelector(
    [(state: RootState) => state.chats.deletedPrivateChatIdList, (_: RootState, chatId: number) => chatId],
    (chatIdList: number[], chatId: number) => chatIdList.includes(chatId),
  );
}
