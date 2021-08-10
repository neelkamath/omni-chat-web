import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityAdapter } from '@reduxjs/toolkit';
import { FetchStatus, RootState } from '../store';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { queryOrMutate } from '@neelkamath/omni-chat';

export namespace ContactsSlice {
  const sliceName = 'contacts';
  const adapter: EntityAdapter<Account> = createEntityAdapter({ selectId: ({ userId }) => userId });

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    readonly status: FetchStatus;
  }

  export const fetchContacts = createAsyncThunk(
    `${sliceName}/fetchContacts`,
    async () => {
      const response = await readContacts();
      return response?.readContacts.edges.map(({ node }) => node);
    },
    {
      condition: (_, { getState }) => {
        const { contacts } = getState() as { contacts: State };
        return contacts.status === 'IDLE';
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

  interface ReadContactsResult {
    readonly readContacts: AccountsConnection;
  }

  async function readContacts(): Promise<ReadContactsResult | undefined> {
    return await operateGraphQlApi(
      async () =>
        await queryOrMutate(
          httpApiConfig,
          {
            query: `
              query ReadContacts {
                readContacts {
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
    reducers: { removeOne: adapter.removeOne, upsertOne: adapter.upsertOne },
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

  export const { removeOne, upsertOne } = slice.actions;

  /** This is only accurate if {@link selectIsLoaded} returns `true`. */
  export const selectIsContact = createSelector(
    (state: RootState) => state.contacts.ids,
    (_: RootState, userId: number) => userId,
    (ids: (string | number)[], userId: number) => ids.includes(userId),
  );

  /** Whether all the contacts have been fetched. */
  export const selectIsLoaded = createSelector(
    (state: RootState) => state.contacts.status === 'LOADED',
    (isLoaded: boolean) => isLoaded,
  );

  export const selectAll = createSelector(
    (state: RootState) => state.contacts.ids.map((id) => parseInt(id.toString())),
    (idList: number[]) => idList,
  );
}
