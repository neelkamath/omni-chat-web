import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Account, UpdatedAccount } from '@neelkamath/omni-chat';
import { QueriesApiWrapper } from '../../api/QueriesApiWrapper';
import { RootState } from '../store';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';

export namespace AccountSlice {
  const sliceName = 'account';

  export interface State {
    /** The user's {@link Account}. `undefined` if it hasn't been fetched yet. */
    readonly data?: Account;
    /** Whether the {@link data} is being fetched. */
    readonly isLoading: boolean;
  }

  export function useFetchAccount(): void {
    const dispatch = useDispatch();
    useEffect(() => {
      dispatch(AccountSlice.fetchAccount());
    }, [dispatch]);
  }

  export const fetchAccount = createAsyncThunk(`${sliceName}/fetchAccount`, QueriesApiWrapper.readAccount, {
    condition: (_, { getState }) => {
      const { account } = getState() as { account: State };
      return account.data === undefined && !account.isLoading;
    },
  });

  const slice = createSlice({
    name: sliceName,
    initialState: { isLoading: false } as State,
    reducers: {
      update: (state, { payload }: PayloadAction<UpdatedAccount>) => {
        state.data = { ...payload, __typename: 'Account', id: payload.id };
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchAccount.rejected, (account) => {
          account.isLoading = false;
        })
        .addCase(fetchAccount.fulfilled, (_, { payload: data }) => ({
          data,
          isLoading: false,
        }))
        .addCase(fetchAccount.pending, (state) => {
          state.isLoading = true;
        });
    },
  });

  export const { reducer } = slice;

  export const { update } = slice.actions;

  /** @returns `undefined` if the {@link Account} hasn't been fetched yet. */
  export const select = createSelector(
    (state: RootState) => state.account,
    ({ data }: State) => data,
  );
}
