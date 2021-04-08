import { createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountEdge, AccountsConnection } from '@neelkamath/omni-chat';
import { RootState } from '../store';

// TODO: Handle deleted accounts even if it glitches the UI.
/**
 * The results of a search for blocked users, contacts, or users registered on the Omni Chat instance being used.
 *
 * We don't remove users who have been unblocked, are no longer a contact, or deleted their account after they've
 * appeared in the search results for the following reasons:
 * - The UI would glitch. For example, if the user is viewing a search result, and then it gets removed from the state,
 * then the displayed user would suddenly disappear.
 * - The user may have accidentally unblocked a user, or deleted a contact. In this case, the specified user should
 * still be displayed so that they can blocked or added as a contact again.
 * - If the user has updated the users they've blocked outside this page (e.g., on another device they're using Omni
 * Chat on at the same time), then they'll refresh the page if they really want to see the updated search results
 * immediately. This is a rare and harmless case since this page will only be viewed for short periods of time.
 */
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
      clear: (state) => {
        state.query = undefined;
        state.hasNextPage = undefined;
        adapter.removeAll(state);
      },
    },
  });

  export const { reducer } = slice;

  export const { replace, add, clear } = slice.actions;

  export const { selectAll } = adapter.getSelectors((state: RootState) => state.searchedUsers);

  export const selectQuery = createSelector(
    (state: RootState) => state.searchedUsers.query,
    (query: string | undefined) => query,
  );

  export const selectHasNextPage = createSelector(
    (state: RootState) => state.searchedUsers.hasNextPage,
    (hasNextPage: boolean | undefined) => (hasNextPage === undefined ? false : hasNextPage),
  );
}
