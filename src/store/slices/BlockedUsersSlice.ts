import {createAsyncThunk, createEntityAdapter, createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Account, BlockedAccount, UnblockedAccount, UpdatedAccount} from '@neelkamath/omni-chat';
import {FetchStatus, RootState} from '../store';
import {QueriesApiWrapper} from '../../api/QueriesApiWrapper';

export namespace BlockedUsersSlice {
  const adapter = createEntityAdapter<Account>();

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    readonly status: FetchStatus;
  }

  export const fetchUsers = createAsyncThunk(
    'blockedUsers/fetchUsers',
    async () => {
      const users = await QueriesApiWrapper.readBlockedUsers();
      return users?.edges?.map(({node}) => node);
    },
    {
      condition: (_, {getState}) => {
        const {blockedUsers} = getState() as {blockedUsers: State};
        return blockedUsers.status === 'IDLE';
      },
    }
  );

  const slice = createSlice({
    name: 'blockedUsers',
    initialState: adapter.getInitialState({status: 'IDLE'}) as State,
    reducers: {
      updateAccount: (state, {payload}: PayloadAction<UpdatedAccount>) => {
        adapter.updateOne(state, {
          id: payload.userId,
          changes: {...payload, __typename: 'Account'},
        });
      },
      upsertOne: (state, {payload}: PayloadAction<BlockedAccount>) => {
        adapter.upsertOne(state, {...payload, __typename: 'Account'});
      },
      removeOne: (state, {payload}: PayloadAction<UnblockedAccount>) => adapter.removeOne(state, payload.id),
    },
    extraReducers: builder => {
      builder
        .addCase(fetchUsers.fulfilled, (state, {payload}) => {
          state.status = 'LOADED';
          if (payload !== undefined) adapter.upsertMany(state, payload);
        })
        .addCase(fetchUsers.rejected, state => {
          state.status = 'IDLE';
        })
        .addCase(fetchUsers.pending, state => {
          state.status = 'LOADING';
        });
    },
  });

  export const {reducer} = slice;

  export const {updateAccount, upsertOne, removeOne} = slice.actions;

  export const {selectAll} = adapter.getSelectors((state: RootState) => state.blockedUsers);

  export const selectIsBlocked = createSelector(
    [(state: RootState) => state.blockedUsers.ids, (_: RootState, userId: number) => userId],
    (ids: (string | number)[], userId: number) => ids.includes(userId)
  );

  /** Whether the users have been fetched yet. */
  export const selectIsLoaded = createSelector(
    (state: RootState) => state.blockedUsers,
    (state: State) => state.status === 'LOADED'
  );
}
