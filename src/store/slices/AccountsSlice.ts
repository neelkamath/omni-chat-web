import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, Dictionary } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { Bio, Name, queryOrMutate, Username } from '@neelkamath/omni-chat';

export namespace AccountsSlice {
  const sliceName = 'accounts';
  const adapter = createEntityAdapter<Account>({ selectId: ({ userId }) => userId });

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    /** The IDs of users currently being fetched. */
    readonly fetching: number[];
  }

  export const fetch = createAsyncThunk(
    `${sliceName}/fetch`,
    async (userId: number) => {
      const response = await readAccount(userId);
      return response?.readAccount;
    },
    {
      condition: (userId, { getState }) => {
        const { accounts } = getState() as { accounts: State };
        return !accounts.ids.includes(userId) && !accounts.fetching.includes(userId);
      },
    },
  );

  export interface Account {
    readonly userId: number;
    readonly username: Username;
    readonly emailAddress: string;
    readonly firstName: Name;
    readonly lastName: Name;
    readonly bio: Bio;
  }

  interface ReadAccountResult {
    readonly readAccount: Account;
  }

  async function readAccount(userId: number): Promise<ReadAccountResult | undefined> {
    return await operateGraphQlApi(
      async () =>
        await queryOrMutate(
          httpApiConfig,
          {
            query: `
              query ReadAccount($userId: Int!) {
                readAccount(userId: $userId) {
                  userId
                  username
                  emailAddress
                  firstName
                  lastName
                  bio
                }
              }
            `,
            variables: { userId },
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

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ fetching: [] }) as State,
    reducers: { update: adapter.upsertOne },
    extraReducers: (builder) => {
      builder
        .addCase(fetch.rejected, (state, { meta }) => {
          state.fetching = state.fetching.filter((userId) => userId !== meta.arg);
        })
        .addCase(fetch.fulfilled, (state, { payload, meta }) => {
          if (payload === undefined) return;
          adapter.upsertOne(state, payload);
          state.fetching = state.fetching.filter((userId) => userId !== meta.arg);
        })
        .addCase(fetch.pending, (state, { meta }) => {
          state.fetching.push(meta.arg);
        });
    },
  });

  export const { reducer } = slice;

  export const { update } = slice.actions;

  /**
   * Returns the specified user. `undefined` will get returned if either the ID passed was `undefined` or the user
   * hasn't been fetched.
   */
  export const select = createSelector(
    (state: RootState) => state.accounts.entities,
    (_: RootState, userId: number | undefined) => userId,
    (entities: Dictionary<Account>, userId: number | undefined) =>
      userId === undefined ? undefined : entities[userId],
  );
}
