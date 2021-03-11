import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AccountsConnection, UpdatedAccount} from '@neelkamath/omni-chat';
import {RootState} from '../store';

export namespace SearchedContactsSlice {
  export interface State {
    /**
     * The query contacts were searched by. `undefined` if no contacts have
     * been searched for yet.
     */
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
      overwrite: (_, {payload}: PayloadAction<Replacer>) => payload,
      updateAccount: (state, {payload}: PayloadAction<UpdatedAccount>) => {
        state.contacts?.edges.forEach(edge => {
          if (edge.node.id === payload.userId)
            edge.node = {...edge.node, id: payload.userId};
        });
      },
    },
  });

  export const {reducer} = slice;

  export const {overwrite, updateAccount} = slice.actions;

  export const selectContacts = createSelector(
    (state: RootState) => state.searchedContacts,
    (searchedContacts: State) => searchedContacts.contacts?.edges
  );

  export const selectQuery = createSelector(
    (state: RootState) => state.searchedContacts,
    (searchedContacts: State) => searchedContacts.query
  );
}
