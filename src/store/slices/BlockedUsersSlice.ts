import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { FetchStatus, RootState } from '../store';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { queryOrMutate } from '@neelkamath/omni-chat';

export namespace BlockedUsersSlice {
  const adapter = createEntityAdapter<Account>({ selectId: ({ userId }) => userId });
  const sliceName = 'blockedUsers';

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    readonly status: FetchStatus;
  }

  export const fetchBlockedUsers = createAsyncThunk(
    `${sliceName}/fetchBlockedUsers`,
    async () => {
      const users = await readBlockedUsers();
      return users?.readBlockedUsers?.edges?.map(({ node }) => node);
    },
    {
      condition: (_, { getState }) => {
        const { blockedUsers } = getState() as { blockedUsers: State };
        return blockedUsers.status === 'IDLE';
      },
    },
  );

  interface AccountsConnection {
    readonly edges: AccountEdge[];
  }

  interface AccountEdge {
    readonly node: Account;
  }

  export interface Account {
    readonly userId: number;
  }

  interface ReadBlockedUsersResult {
    readonly readBlockedUsers: AccountsConnection;
  }

  async function readBlockedUsers(): Promise<ReadBlockedUsersResult | undefined> {
    return await operateGraphQlApi(
      async () =>
        await queryOrMutate(
          httpApiConfig,
          {
            query: `
              query ReadBlockedUsers {
                readBlockedUsers {
                  edges {
                    node {
                      userId
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

  export interface UpdatedAccount {
    readonly userId: number;
  }

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ status: 'IDLE' }) as State,
    reducers: {
      upsertOne: adapter.upsertOne,
      removeOne: adapter.removeOne,
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchBlockedUsers.fulfilled, (state, { payload }) => {
          state.status = 'LOADED';
          if (payload !== undefined) adapter.upsertMany(state, payload);
        })
        .addCase(fetchBlockedUsers.rejected, (state) => {
          state.status = 'IDLE';
        })
        .addCase(fetchBlockedUsers.pending, (state) => {
          state.status = 'LOADING';
        });
    },
  });

  export const { reducer } = slice;

  export const { upsertOne, removeOne } = slice.actions;

  export const selectIsBlocked = createSelector(
    (state: RootState) => state.blockedUsers.ids,
    (_: RootState, userId: number) => userId,
    (ids: (string | number)[], userId: number) => ids.includes(userId),
  );

  /** Whether the users have been fetched yet. */
  export const selectIsLoaded = createSelector(
    (state: RootState) => state.blockedUsers.status === 'LOADED',
    (isLoaded: boolean) => isLoaded,
  );
}
