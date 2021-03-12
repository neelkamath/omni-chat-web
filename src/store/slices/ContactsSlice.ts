import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityAdapter,
  PayloadAction,
} from '@reduxjs/toolkit';
import { QueriesApiWrapper } from '../../api/QueriesApiWrapper';
import { Account, DeletedContact, NewContact, UpdatedAccount } from '@neelkamath/omni-chat';
import { FetchStatus, RootState } from '../store';

export namespace ContactsSlice {
  const adapter: EntityAdapter<Account> = createEntityAdapter();

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    readonly status: FetchStatus;
  }

  export const fetchContacts = createAsyncThunk(
    'contacts/fetchContacts',
    async () => {
      const contacts = await QueriesApiWrapper.readContacts();
      return contacts?.edges.map(({ node }) => node);
    },
    {
      condition: (_, { getState }) => {
        const { contacts } = getState() as { contacts: State };
        return contacts.status === 'IDLE';
      },
    },
  );

  const slice = createSlice({
    name: 'contacts',
    initialState: adapter.getInitialState({ status: 'IDLE' }) as State,
    reducers: {
      updateOne: (state, { payload }: PayloadAction<UpdatedAccount>) => {
        adapter.updateOne(state, {
          id: payload.userId,
          changes: { ...payload, __typename: 'Account' },
        });
      },
      removeOne: (state, { payload }: PayloadAction<DeletedContact>) => adapter.removeOne(state, payload.id),
      upsertOne: (state, { payload }: PayloadAction<NewContact>) => {
        adapter.upsertOne(state, { ...payload, __typename: 'Account' });
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchContacts.pending, (state) => {
          state.status = 'LOADING';
        })
        .addCase(fetchContacts.rejected, (state) => {
          state.status = 'IDLE';
        })
        .addCase(fetchContacts.fulfilled, (state, { payload }) => {
          state.status = 'LOADED';
          if (payload !== undefined) adapter.upsertMany(state, payload);
        });
    },
  });

  export const { reducer } = slice;

  export const { updateOne, removeOne, upsertOne } = slice.actions;

  export const selectIsContact = createSelector(
    [(state: RootState) => state.contacts.ids, (_: RootState, userId: number) => userId],
    (ids: (string | number)[], userId: number) => ids.includes(userId),
  );

  /** Whether all the contacts have been fetched. */
  export const selectIsLoaded = createSelector(
    (state: RootState) => state.contacts,
    (contacts: State) => contacts.status === 'LOADED',
  );
}
