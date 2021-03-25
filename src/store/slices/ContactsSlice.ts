import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityAdapter,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Account, DeletedContact, NewContact, readContacts, UpdatedAccount } from '@neelkamath/omni-chat';
import { FetchStatus, RootState } from '../store';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';

export namespace ContactsSlice {
  const adapter: EntityAdapter<Account> = createEntityAdapter();

  const sliceName = 'contacts';

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    readonly status: FetchStatus;
  }

  export const fetchContacts = createAsyncThunk(
    `${sliceName}/fetchContacts`,
    async () => {
      const result = await operateGraphQlApi(() => readContacts(httpApiConfig, Storage.readAccessToken()!));
      return result?.readContacts.edges.map(({ node }) => node);
    },
    {
      condition: (_, { getState }) => {
        const { contacts } = getState() as { contacts: State };
        return contacts.status === 'IDLE';
      },
    },
  );

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ status: 'IDLE' }) as State,
    reducers: {
      updateOne: (state, { payload }: PayloadAction<UpdatedAccount>) => {
        adapter.updateOne(state, {
          id: payload.id,
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
    (state: RootState) => state.contacts.status,
    (status: FetchStatus) => status === 'LOADED',
  );
}
