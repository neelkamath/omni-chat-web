import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountEdge, AccountsConnection, UpdatedAccount } from '@neelkamath/omni-chat';
import { RootState } from '../store';

export namespace SearchedContactsSlice {
  export interface State {
    /** The query contacts were searched by. `undefined` if no contacts have been searched for yet. */
    readonly query?: string;
    /** `undefined` if no contacts have been searched for yet. */
    readonly contacts?: AccountsConnection;
  }

  export interface Replacer {
    /** `undefined` if no query was used to filter searched contacts. */
    readonly query?: string;
    readonly contacts: AccountsConnection;
  }

  const slice = createSlice({
    name: 'searchedContacts',
    initialState: {} as State,
    reducers: {
      overwrite: (_, { payload }: PayloadAction<Replacer>) => payload,
      clear: () => ({}),
      updateAccount: (state, { payload }: PayloadAction<UpdatedAccount>) => {
        state.contacts?.edges.forEach((edge) => {
          if (edge.node.id === payload.id) edge.node = { ...payload, __typename: 'Account' };
        });
      },
    },
  });

  export const { reducer } = slice;

  export const { overwrite, updateAccount, clear } = slice.actions;

  export const selectContacts = createSelector(
    (state: RootState) => state.searchedContacts.contacts?.edges,
    (edges: AccountEdge[] | undefined) => edges,
  );

  export const selectQuery = createSelector(
    (state: RootState) => state.searchedContacts.query,
    (query: string | undefined) => query,
  );
}
