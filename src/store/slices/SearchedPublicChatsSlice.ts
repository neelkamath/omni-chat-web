import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Cursor, GroupChatDescription, GroupChatTitle, queryOrMutate } from '@neelkamath/omni-chat';
import { ForwardPagination } from '../../pagination';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { Storage } from '../../Storage';

export namespace SearchedPublicChatsSlice {
  const sliceName = 'searchedPublicChats';

  const pagination: ForwardPagination = { first: 10 };

  const adapter = createEntityAdapter<GroupChatEdge>({ selectId: ({ node }) => node.chatId });

  interface SearchPublicChatsResult {
    readonly searchPublicChats: GroupChatsConnection;
  }

  interface GroupChatsConnection {
    readonly edges: GroupChatEdge[];
    readonly pageInfo: PageInfo;
  }

  interface PageInfo {
    readonly hasNextPage: boolean;
  }

  export interface GroupChatEdge {
    readonly node: GroupChat;
    readonly cursor: Cursor;
  }

  export interface GroupChat {
    readonly chatId: number;
    readonly title: GroupChatTitle;
    readonly description: GroupChatDescription;
  }

  async function searchPublicChats(
    query: string,
    pagination?: ForwardPagination,
  ): Promise<SearchPublicChatsResult | undefined> {
    return await operateGraphQlApi(
      async () =>
        await queryOrMutate(
          httpApiConfig,
          {
            query: `
              query SearchPublicChats($query: String!, $first: Int, $after: Cursor) {
                searchPublicChats(query: $query, first: $first, after: $after) {
                  pageInfo {
                    hasNextPage
                  }
                  edges {
                    cursor
                    node {
                      chatId
                      title
                      description
                    }
                  }
                }
              }
            `,
            variables: { query, first: pagination?.first, after: pagination?.after },
          },
          Storage.readAccessToken()!,
        ),
    );
  }

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    /** The query chats were searched by. `undefined` if no chats have been searched for yet. */
    readonly query?: string;
    /** Pagination (i.e., {@link PageInfo} parameter). `undefined` if no chats have been searched for yet. */
    readonly hasNextPage?: boolean;
  }

  /** Adds the next page of chats to the state. */
  export const fetchAdditional = createAsyncThunk(`${sliceName}/fetchAdditional`, async (_, { getState }) => {
    const { searchedPublicChats } = getState() as { searchedPublicChats: State };
    const query = searchedPublicChats.query!;
    const chats = selectAll(getState() as RootState);
    const after = chats[chats.length - 1]?.cursor;
    const response = await searchPublicChats(query, { ...pagination, after });
    return response?.searchPublicChats;
  });

  /** Overwrites the saved chats. */
  export const fetchReplacement = createAsyncThunk(`${sliceName}/fetchReplacement`, async (query: string) => {
    const response = await searchPublicChats(query, pagination);
    return { query, connection: response?.searchPublicChats };
  });

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState() as State,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchReplacement.fulfilled, (state, { payload }) => {
          if (payload?.connection === undefined) return;
          state.query = payload.query;
          state.hasNextPage = payload.connection.pageInfo.hasNextPage;
          adapter.setAll(state, payload.connection.edges);
        })
        .addCase(fetchAdditional.fulfilled, (state, { payload }) => {
          if (payload === undefined) return;
          state.hasNextPage = payload.pageInfo.hasNextPage;
          adapter.addMany(state, payload.edges);
        });
    },
  });

  export const { reducer } = slice;

  export const { selectAll } = adapter.getSelectors((state: RootState) => state.searchedPublicChats);

  export const selectQuery = createSelector(
    (state: RootState) => state.searchedPublicChats.query,
    (query: string | undefined) => query,
  );

  export const selectHasNextPage = createSelector(
    (state: RootState) => state.searchedPublicChats.hasNextPage,
    (hasNextPage: boolean | undefined) => (hasNextPage === undefined ? false : hasNextPage),
  );
}
