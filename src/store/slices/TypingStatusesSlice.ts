import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  Dictionary,
  EntityAdapter,
  PayloadAction,
} from '@reduxjs/toolkit';
import { readTypingUsers, TypingStatus } from '@neelkamath/omni-chat';
import { FetchStatus, RootState } from '../store';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';

export namespace TypingStatusesSlice {
  const sliceName = 'typingStatuses';

  export interface Entity {
    readonly id: string; // Generated using <generateId()>.
    readonly isTyping: boolean;
  }

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    readonly status: FetchStatus;
  }

  const adapter: EntityAdapter<Entity> = createEntityAdapter();

  /** Generates the {@link TypingStatusesSlice.Entity.id} */
  function generateId(userId: number, chatId: number): string {
    return `${userId}_${chatId}`;
  }

  export const fetchStatuses = createAsyncThunk(
    `${sliceName}/fetchStatuses`,
    async () => {
      const chats = await operateGraphQlApi(() => readTypingUsers(httpApiConfig, Storage.readAccessToken()!));
      return chats?.readTypingUsers.flatMap(({ chatId, users }) =>
        users.map(({ id }) => ({ id: generateId(id, chatId), isTyping: true })),
      );
    },
    {
      condition: (_, { getState }) => {
        const { typingStatuses } = getState() as { typingStatuses: State };
        return typingStatuses.status === 'IDLE';
      },
    },
  );

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ status: 'IDLE' }) as State,
    reducers: {
      upsertOne: (state, { payload }: PayloadAction<TypingStatus>) => {
        const entity = { id: generateId(payload.userId, payload.chatId), ...payload };
        adapter.upsertOne(state, entity);
      },
      // TODO: Test once typing statuses have been implemented.
      /** Removes the specified user ID's statuses. */
      removeUser: (state, { payload }: PayloadAction<number>) =>
        Object.values(state.entities).forEach((entity) => {
          if (entity !== undefined && entity.id.startsWith(`${payload}_`)) adapter.removeOne(state, entity.id);
        }),
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchStatuses.rejected, (state) => {
          state.status = 'IDLE';
        })
        .addCase(fetchStatuses.fulfilled, (state, { payload }) => {
          state.status = 'LOADED';
          if (payload !== undefined) adapter.upsertMany(state, payload);
        })
        .addCase(fetchStatuses.pending, (state) => {
          state.status = 'LOADING';
        });
    },
  });

  export const { reducer } = slice;

  export const { upsertOne, removeUser } = slice.actions;

  export const selectIsTyping = createSelector(
    [
      (state: RootState) => state.typingStatuses.entities,
      (_: RootState, userId: number) => userId,
      (_state: RootState, _userId: number, chatId: number) => chatId,
    ],
    (entities: Dictionary<Entity>, userId: number, chatId: number) =>
      entities[generateId(userId, chatId)]?.isTyping === true,
  );
}
