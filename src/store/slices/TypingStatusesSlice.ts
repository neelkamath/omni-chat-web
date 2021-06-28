import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  Dictionary,
  Draft,
  EntityAdapter,
  PayloadAction,
} from '@reduxjs/toolkit';
import { FetchStatus, RootState } from '../store';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { queryOrMutate } from '@neelkamath/omni-chat';

export namespace TypingStatusesSlice {
  const sliceName = 'typingStatuses';

  export interface Entity {
    readonly id: string; // Generated using <generateId()>.
    readonly chatId: number;
    readonly userId: number;
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

  export const fetch = createAsyncThunk(
    `${sliceName}/fetch`,
    async () => {
      const response = await readTypingUsers();
      return response?.readTypingUsers.flatMap(({ chatId, users }) =>
        users.map(({ userId }) => ({ id: generateId(userId, chatId), chatId, userId, isTyping: true })),
      );
    },
    {
      condition: (_, { getState }) => {
        const { typingStatuses } = getState() as { typingStatuses: State };
        return typingStatuses.status === 'IDLE';
      },
    },
  );

  interface ReadTypingUsersResult {
    readonly readTypingUsers: TypingUsers[];
  }

  interface TypingUsers {
    readonly chatId: number;
    readonly users: Account[];
  }

  interface Account {
    readonly userId: number;
  }

  async function readTypingUsers(): Promise<ReadTypingUsersResult | undefined> {
    return await operateGraphQlApi(
      async () =>
        await queryOrMutate(
          httpApiConfig,
          {
            query: `
              query readTypingUsers {
                readTypingUsers {
                  chatId
                  users {
                    userId
                  }
                }
              }
            `,
          },
          Storage.readAccessToken()!,
        ),
    );
  }

  export interface TypingStatus {
    readonly userId: number;
    readonly chatId: number;
    readonly isTyping: boolean;
  }

  function reduceUpsertOne(state: Draft<State>, { payload }: PayloadAction<TypingStatus>): State | void {
    const entity = { id: generateId(payload.userId, payload.chatId), ...payload };
    adapter.upsertOne(state, entity);
  }

  /** Removes the specified user ID's statuses. */
  function reduceRemoveUser(state: Draft<State>, { payload }: PayloadAction<number>): State | void {
    Object.values(state.entities).forEach((entity) => {
      if (entity !== undefined && entity.id.startsWith(`${payload}_`)) adapter.removeOne(state, entity.id);
    });
  }

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ status: 'IDLE' }) as State,
    reducers: { upsertOne: reduceUpsertOne, removeUser: reduceRemoveUser },
    extraReducers: (builder) => {
      builder
        .addCase(fetch.rejected, (state) => {
          state.status = 'IDLE';
        })
        .addCase(fetch.fulfilled, (state, { payload }) => {
          if (payload !== undefined) {
            adapter.upsertMany(state, payload);
            state.status = 'LOADED';
          } else state.status = 'IDLE';
        })
        .addCase(fetch.pending, (state) => {
          state.status = 'LOADING';
        });
    },
  });

  export const { reducer } = slice;

  export const { upsertOne, removeUser } = slice.actions;

  export const selectIsTyping = createSelector(
    (state: RootState) => state.typingStatuses.entities,
    (_: RootState, userId: number) => userId,
    (_state: RootState, _userId: number, chatId: number) => chatId,
    (entities: Dictionary<Entity>, userId: number, chatId: number) =>
      entities[generateId(userId, chatId)]?.isTyping === true,
  );

  export const selectTyping = createSelector(
    (state: RootState) => state.typingStatuses.entities,
    (_: RootState, chatId: number) => chatId,
    (entities: Dictionary<Entity>, chatId: number) =>
      Object.values(entities)
        .filter((entity) => entity?.chatId === chatId)
        .map((entity) => entity!.userId),
  );
}
