import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  Dictionary,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  BackwardPagination,
  Chat,
  ForwardPagination,
  PrivateChat,
  readChat,
  readChats,
  UpdatedAccount,
} from '@neelkamath/omni-chat';
import { FetchStatus, RootState } from '../store';
import { BlockedUsersSlice } from './BlockedUsersSlice';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';

const privateChatMessagesPagination: BackwardPagination = { last: 1 };
const groupChatUsersPagination: ForwardPagination = { first: 0 };
const groupChatMessagesPagination: BackwardPagination = { last: 1 };

async function operateReadChat(id: number): Promise<Chat | undefined> {
  const result = await operateGraphQlApi(() => readChat(
    httpApiConfig,
    Storage.readAccessToken()!,
    id,
    privateChatMessagesPagination,
    groupChatUsersPagination,
    groupChatMessagesPagination,
  ));
  return result?.readChat.__typename === 'InvalidChatId' ? undefined : result?.readChat;
}

async function operateReadChats(): Promise<Chat[] | undefined> {
  const result = await operateGraphQlApi(() => readChats(
    httpApiConfig,
    Storage.readAccessToken()!,
    privateChatMessagesPagination,
    groupChatUsersPagination,
    groupChatMessagesPagination,
  ));
  return result?.readChats;
}

/**
 * Stores every chat the user is in. Only the last message sent in ({@link Chat.messages}) is stored. Group chats don't
 * store their participants in {@link GroupChat.users}.
 */
export namespace ChatsSlice {
  const sliceName = 'chats';

  // TODO: Test once chat messages are implemented.
  const adapter = createEntityAdapter<Chat>({
    sortComparer: (a, b) => {
      const readSent = (chat: Chat) => {
        const sent = chat.messages.edges[0]?.node.dateTimes.sent;
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

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ status: 'IDLE', fetching: [] }) as State,
    reducers: {
      removeOne: (state, { payload }: PayloadAction<number>) => adapter.removeOne(state, payload),
      // TODO: Test once chat messages are implemented.
      updateAccount: (state, { payload }: PayloadAction<UpdatedAccount>) => {
        Object.values(state.entities).forEach((entity) => {
          const node = entity?.messages.edges[0]?.node;
          if (payload.username === node?.sender.username) node.sender = { ...payload, __typename: 'Account' };
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
          if (payload !== undefined) adapter.upsertMany(state, payload);
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

  export const { removeOne, updateAccount } = slice.actions;

  const { selectAll } = adapter.getSelectors((state: RootState) => state.chats);

  /** Selects every chat the user is in excluding private chats with blocked users. */
  export const selectChats = createSelector(
    (state: RootState) => state,
    (state: RootState) => {
      return selectAll(state).filter((chat) => {
        if (chat.__typename === 'PrivateChat') {
          const userId = (chat as PrivateChat).user.id;
          return !BlockedUsersSlice.selectIsBlocked(state, userId);
        }
        return true;
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
}
