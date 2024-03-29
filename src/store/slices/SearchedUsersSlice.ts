import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, Draft } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Cursor, queryOrMutate } from '@neelkamath/omni-chat';
import { ForwardPagination } from '../../pagination';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { Storage } from '../../Storage';

/**
 * The results of a search for blocked users, contacts, or users registered on the Omni Chat instance being used.
 *
 * We don't remove users who have either been unblocked or are no longer a contact after they've appeared in the search
 * results because the user may have accidentally unblocked a user, or deleted a contact. In such a case, the specified
 * user should still be displayed so that they can blocked or added as a contact again.
 */
export namespace SearchedUsersSlice {
  const sliceName = 'searchedUsers';
  const pagination: ForwardPagination = { first: 10 };
  const adapter = createEntityAdapter<AccountEdge>({ selectId: ({ node }) => node.userId });

  export interface AccountEdge {
    readonly cursor: Cursor;
    readonly node: Account;
  }

  export interface Account {
    readonly userId: number;
  }

  const accountsConnectionFragment = `
    pageInfo {
      hasNextPage
    }
    edges {
      cursor
      node {
        userId
      }
    }
  `;

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    /** The query users were searched by. `undefined` if no users have been searched for yet. */
    readonly query?: string;
    /** Pagination (i.e., {@link PageInfo} parameter). `undefined` if no users have been searched for yet. */
    readonly hasNextPage?: boolean;
    readonly isFetchingInitialState: boolean;
    readonly isFetchingAdditional: boolean;
  }

  interface AccountsConnection {
    readonly pageInfo: PageInfo;
    readonly edges: AccountEdge[];
  }

  interface PageInfo {
    readonly hasNextPage: boolean;
  }

  /**
   * - `'USERS'` indicates every user registered on the Omni Chat instance.
   * - `'CONTACTS'` indicates the user's saved contacts.
   * - `'BLOCKED_USERS'` indicates the users blocked by the user.
   */
  export type SearchUsersType = 'USERS' | 'CONTACTS' | 'BLOCKED_USERS';

  /** Adds the next page of users to the state. */
  export const fetchAdditional = createAsyncThunk(
    `${sliceName}/fetchAdditional`,
    async (type: SearchUsersType, { getState }) => {
      const { searchedUsers } = getState() as { searchedUsers: State };
      const query = searchedUsers.query!;
      const users = selectAll(getState() as RootState);
      const after = users[users.length - 1]?.cursor;
      let connection: AccountsConnection | undefined;
      switch (type) {
        case 'USERS': {
          const response = await searchUsers(query, { ...pagination, after });
          connection = response?.searchUsers;
          break;
        }
        case 'CONTACTS': {
          const response = await searchContacts(query, { ...pagination, after });
          connection = response?.searchContacts;
          break;
        }
        case 'BLOCKED_USERS': {
          const response = await searchBlockedUsers(query, { ...pagination, after });
          connection = response?.searchBlockedUsers;
        }
      }
      return connection;
    },
  );

  /**
   * Overwrites the state. If the `type` is `'BLOCKED_USERS'`, then the first page of blocked users will be fetched. If
   * the `type` is `'CONTACTS'`, then the first page of contacts will be fetched. If the `type` is `'USERS'`, then no
   * users will be fetched.
   */
  export const fetchInitialState = createAsyncThunk(`${sliceName}/fetchInitialState`, async (type: SearchUsersType) => {
    const query = '';
    let connection: AccountsConnection | undefined = undefined;
    switch (type) {
      case 'BLOCKED_USERS': {
        const response = await searchBlockedUsers(query, pagination);
        connection = response?.searchBlockedUsers;
        break;
      }
      case 'CONTACTS': {
        const response = await searchContacts(query, pagination);
        connection = response?.searchContacts;
      }
    }
    return connection;
  });

  export interface Replacer {
    readonly query: string;
    readonly type: SearchUsersType;
  }

  /** Overwrites the saved users. */
  export const fetchReplacement = createAsyncThunk(
    `${sliceName}/fetchReplacement`,
    async ({ query, type }: Replacer) => {
      let connection: AccountsConnection | undefined;
      switch (type) {
        case 'USERS': {
          const response = await searchUsers(query, pagination);
          connection = response?.searchUsers;
          break;
        }
        case 'BLOCKED_USERS': {
          const response = await searchBlockedUsers(query, pagination);
          connection = response?.searchBlockedUsers;
          break;
        }
        case 'CONTACTS': {
          const response = await searchContacts(query, pagination);
          connection = response?.searchContacts;
          break;
        }
      }
      return { query, connection };
    },
  );

  interface SearchUsersResult {
    readonly searchUsers: AccountsConnection;
  }

  async function searchUsers(query: string, pagination: ForwardPagination): Promise<SearchUsersResult | undefined> {
    return operateGraphQlApi(
      async () =>
        await queryOrMutate(httpApiConfig, {
          query: `
            query SearchUsers($query: String!, $first: Int, $after: Cursor) {
              searchUsers(query: $query, first: $first, after: $after) {
                ${accountsConnectionFragment}
              }
            }
          `,
          variables: { query, first: pagination.first, after: pagination.after },
        }),
    );
  }

  interface SearchContactsResult {
    readonly searchContacts: AccountsConnection;
  }

  async function searchContacts(
    query: string,
    pagination: ForwardPagination,
  ): Promise<SearchContactsResult | undefined> {
    return await operateGraphQlApi(
      async () =>
        await queryOrMutate(
          httpApiConfig,
          {
            query: `
              query SearchContacts($query: String!, $first: Int, $after: Cursor) {
                searchContacts(query: $query, first: $first, after: $after) {
                  ${accountsConnectionFragment}
                }
              }
            `,
            variables: { query, first: pagination.first, after: pagination.after },
          },
          Storage.readAccessToken()!,
        ),
    );
  }

  interface SearchBlockedUsersResult {
    readonly searchBlockedUsers: AccountsConnection;
  }

  async function searchBlockedUsers(
    query: string,
    pagination: ForwardPagination,
  ): Promise<SearchBlockedUsersResult | undefined> {
    return await operateGraphQlApi(
      async () =>
        await queryOrMutate(
          httpApiConfig,
          {
            query: `
              query SearchBlockedUsers($query: String!, $first: Int, $after: Cursor) {
                searchBlockedUsers(query: $query, first: $first, after: $after) {
                  ${accountsConnectionFragment}
                }
              }
            `,
            variables: { query, first: pagination.first, after: pagination.after },
          },
          Storage.readAccessToken()!,
        ),
    );
  }

  function reduceClear(state: Draft<State>): State | void {
    state.query = undefined;
    state.hasNextPage = undefined;
    adapter.removeAll(state);
  }

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ isFetchingInitialState: false, isFetchingAdditional: false }) as State,
    reducers: { clear: reduceClear, removeOne: adapter.removeOne },
    extraReducers: (builder) => {
      builder
        .addCase(fetchAdditional.pending, (state) => {
          state.isFetchingAdditional = true;
        })
        .addCase(fetchAdditional.fulfilled, (state, { payload }) => {
          state.isFetchingAdditional = false;
          if (payload === undefined) return;
          state.hasNextPage = payload.pageInfo.hasNextPage;
          adapter.addMany(state, payload.edges);
        })
        .addCase(fetchAdditional.rejected, (state) => {
          state.isFetchingAdditional = false;
        })
        .addCase(fetchReplacement.fulfilled, (state, { payload }) => {
          if (payload?.connection === undefined) return;
          state.query = payload.query;
          state.hasNextPage = payload.connection.pageInfo.hasNextPage;
          adapter.setAll(state, payload.connection.edges);
        })
        .addCase(fetchInitialState.pending, (state) => {
          state.isFetchingInitialState = true;
        })
        .addCase(fetchInitialState.fulfilled, (state, { payload }) => {
          state.isFetchingInitialState = false;
          state.query = '';
          if (payload === undefined) return;
          state.hasNextPage = payload.pageInfo.hasNextPage;
          adapter.setAll(state, payload.edges);
        })
        .addCase(fetchInitialState.rejected, (state) => {
          state.isFetchingInitialState = false;
        });
    },
  });

  export const { reducer } = slice;

  export const { clear, removeOne } = slice.actions;

  export const { selectAll } = adapter.getSelectors((state: RootState) => state.searchedUsers);

  export const selectQuery = createSelector(
    (state: RootState) => state.searchedUsers.query,
    (query: string | undefined) => query,
  );

  export const selectHasNextPage = createSelector(
    ({ searchedUsers }: RootState) => searchedUsers.hasNextPage ?? false,
    (hasNextPage: boolean) => hasNextPage,
  );

  export const selectIsFetchingInitialState = createSelector(
    ({ searchedUsers }: RootState) => searchedUsers,
    ({ isFetchingInitialState }: State) => isFetchingInitialState,
  );

  export const selectIsFetchingAdditional = createSelector(
    ({ searchedUsers }: RootState) => searchedUsers,
    ({ isFetchingAdditional }: State) => isFetchingAdditional,
  );
}
