import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  Draft,
  PayloadAction,
} from '@reduxjs/toolkit';
import { FetchStatus, RootState } from '../store';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { Bio, Name, queryOrMutate, Username } from '@neelkamath/omni-chat';

export namespace BlockedUsersSlice {
  const adapter = createEntityAdapter<Account>({ selectId: ({ userId }) => userId });

  const sliceName = 'blockedUsers';

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    readonly status: FetchStatus;
  }

  export const fetchUsers = createAsyncThunk(
    `${sliceName}/fetchUsers`,
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
    readonly username: Username;
    readonly emailAddress: string;
    readonly firstName: Name;
    readonly lastName: Name;
    readonly bio: Bio;
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
                      username
                      emailAddress
                      firstName
                      lastName
                      bio
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
    readonly username: Username;
    readonly emailAddress: string;
    readonly firstName: Name;
    readonly lastName: Name;
    readonly bio: Bio;
  }

  function reduceUpdateAccount(state: Draft<State>, { payload }: PayloadAction<UpdatedAccount>): State | void {
    adapter.updateOne(state, { id: payload.userId, changes: payload });
  }

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ status: 'IDLE' }) as State,
    reducers: {
      updateAccount: reduceUpdateAccount,
      upsertOne: adapter.upsertOne,
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