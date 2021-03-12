import { createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountEdge, AccountsConnection, UpdatedAccount } from '@neelkamath/omni-chat';
import { RootState } from '../store';

export namespace SearchedUsersSlice {
  const adapter = createEntityAdapter<AccountEdge>({
    selectId: (model) => model.cursor,
    sortComparer: (a, b) => a.cursor.localeCompare(b.cursor),
  });

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    /** The query users were searched by. `undefined` if no users have been searched for yet. */
    readonly query?: string;
    /** Pagination (i.e., {@link PageInfo} parameter). `undefined` if no users have been searched for yet. */
    readonly hasNextPage?: boolean;
  }

  export interface Replacer {
    readonly query: string;
    readonly users: AccountsConnection;
  }

  const slice = createSlice({
    name: 'searchedUsers',
    initialState: adapter.getInitialState() as State,
    reducers: {
      replace: (state, { payload }: PayloadAction<Replacer>) => {
        state.query = payload.query;
        state.hasNextPage = payload.users.pageInfo.hasNextPage;
        adapter.setAll(state, payload.users.edges);
      },
      add: (state, { payload }: PayloadAction<AccountsConnection>) => {
        state.hasNextPage = payload.pageInfo.hasNextPage;
        adapter.addMany(state, payload.edges);
      },
      update: (state, { payload }: PayloadAction<UpdatedAccount>) => {
        const user = state.entities[payload.userId];
        if (user !== undefined) user.node = { ...payload, __typename: 'Account', id: payload.userId };
      },
    },
  });

  export const { reducer } = slice;

  export const { replace, add, update } = slice.actions;

  export const { selectAll } = adapter.getSelectors((state: RootState) => state.searchedUsers);

  export const selectQuery = createSelector(
    (state: RootState) => state.searchedUsers,
    (state: State) => state.query,
  );

  export const selectHasNextPage = createSelector(
    (state: RootState) => state.searchedUsers,
    (state: State) => (state.hasNextPage === undefined ? false : state.hasNextPage),
  );
}
