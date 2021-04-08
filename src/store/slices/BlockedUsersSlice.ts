import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Account, BlockedAccount, readBlockedUsers, UpdatedAccount } from '@neelkamath/omni-chat';
import { FetchStatus, RootState } from '../store';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';

export namespace BlockedUsersSlice {
  const adapter = createEntityAdapter<Account>();

  const sliceName = 'blockedUsers';

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    readonly status: FetchStatus;
  }

  export const fetchUsers = createAsyncThunk(
    `${sliceName}/fetchUsers`,
    async () => {
      const users = await operateGraphQlApi(() => readBlockedUsers(httpApiConfig, Storage.readAccessToken()!));
      return users?.readBlockedUsers?.edges?.map(({ node }) => node);
    },
    {
      condition: (_, { getState }) => {
        const { blockedUsers } = getState() as { blockedUsers: State };
        return blockedUsers.status === 'IDLE';
      },
    },
  );

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ status: 'IDLE' }) as State,
    reducers: {
      updateAccount: (state, { payload }: PayloadAction<UpdatedAccount>) => {
        adapter.updateOne(state, {
          id: payload.id,
          changes: { ...payload, __typename: 'Account' },
        });
      },
      upsertOne: (state, { payload }: PayloadAction<BlockedAccount>) => {
        adapter.upsertOne(state, { ...payload, __typename: 'Account' });
      },
      removeOne: adapter.removeOne,
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchUsers.fulfilled, (state, { payload }) => {
          state.status = 'LOADED';
          if (payload !== undefined) adapter.upsertMany(state, payload);
        })
        .addCase(fetchUsers.rejected, (state) => {
          state.status = 'IDLE';
        })
        .addCase(fetchUsers.pending, (state) => {
          state.status = 'LOADING';
        });
    },
  });

  export const { reducer } = slice;

  export const { updateAccount, upsertOne, removeOne } = slice.actions;

  export const { selectAll } = adapter.getSelectors((state: RootState) => state.blockedUsers);

  export const selectIsBlocked = createSelector(
    [(state: RootState) => state.blockedUsers.ids, (_: RootState, userId: number) => userId],
    (ids: (string | number)[], userId: number) => ids.includes(userId),
  );

  /** Whether the users have been fetched yet. */
  export const selectIsLoaded = createSelector(
    (state: RootState) => state.blockedUsers.status,
    (status: FetchStatus) => status === 'LOADED',
  );
}
