import { createAsyncThunk, createSelector, createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { Bio, Name, queryOrMutate, Username } from '@neelkamath/omni-chat';

export namespace AccountSlice {
  const sliceName = 'account';

  export interface State {
    /** The user's {@link Account}. `undefined` if it hasn't been fetched yet. */
    readonly data?: Account;
    /** Whether the {@link data} is being fetched. */
    readonly isLoading: boolean;
  }

  export const fetchAccount = createAsyncThunk(
    `${sliceName}/fetchAccount`,
    async () => {
      const response = await readAccount(Storage.readUserId()!);
      return response?.readAccount;
    },
    {
      condition: (_, { getState }) => {
        const { account } = getState() as { account: State };
        return account.data === undefined && !account.isLoading;
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

  function reduceUpdate(state: Draft<State>, { payload }: PayloadAction<UpdatedAccount>): State | void {
    state.data = payload;
  }

  const slice = createSlice({
    name: sliceName,
    initialState: { isLoading: false } as State,
    reducers: { update: reduceUpdate },
    extraReducers: (builder) => {
      builder
        .addCase(fetchAccount.rejected, (state) => {
          state.isLoading = false;
        })
        .addCase(fetchAccount.fulfilled, (_, { payload: data }) => ({ data, isLoading: false }))
        .addCase(fetchAccount.pending, (state) => {
          state.isLoading = true;
        });
    },
  });

  export const { reducer } = slice;

  export const { update } = slice.actions;

  /** Returns `undefined` if the {@link Account} hasn't been fetched yet. */
  export const select = createSelector(
    (state: RootState) => state.account.data,
    (data: Account | undefined) => data,
  );
}
