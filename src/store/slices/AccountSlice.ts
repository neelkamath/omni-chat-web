import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Account, readAccount, UpdatedAccount } from '@neelkamath/omni-chat';
import { RootState } from '../store';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';

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
      const result = await operateGraphQlApi(() => readAccount(httpApiConfig, Storage.readAccessToken()!));
      return result?.readAccount;
    },
    {
      condition: (_, { getState }) => {
        const { account } = getState() as { account: State };
        return account.data === undefined && !account.isLoading;
      },
    },
  );

  const slice = createSlice({
    name: sliceName,
    initialState: { isLoading: false } as State,
    reducers: {
      update: (state, { payload }: PayloadAction<UpdatedAccount>) => {
        state.data = { ...payload, __typename: 'Account' };
      },
    },
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

  /** @returns `undefined` if the {@link Account} hasn't been fetched yet. */
  export const select = createSelector(
    (state: RootState) => state.account.data,
    (data: Account | undefined) => data,
  );
}
