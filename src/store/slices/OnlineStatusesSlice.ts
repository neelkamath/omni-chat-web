import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  Dictionary,
  EntityAdapter,
} from '@reduxjs/toolkit';
import { RootState } from '../store';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { DateTime, queryOrMutate } from '@neelkamath/omni-chat';

export namespace OnlineStatusesSlice {
  const adapter: EntityAdapter<OnlineStatus> = createEntityAdapter({ selectId: ({ userId }) => userId });

  const sliceName = 'onlineStatuses';

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    /** The IDs of users whose statuses are currently being fetched. */
    readonly fetching: number[];
  }

  async function operateReadOnlineStatus(userId: number): Promise<OnlineStatus | undefined> {
    const response = await readOnlineStatus(userId);
    return response?.readOnlineStatus.__typename === 'InvalidUserId' ? undefined : response?.readOnlineStatus;
  }

  interface ReadOnlineStatusResult {
    readonly readOnlineStatus: OnlineStatus | InvalidUserId;
  }

  export interface OnlineStatus {
    readonly __typename: 'OnlineStatus';
    readonly userId: number;
    readonly isOnline: boolean;
    readonly lastOnline: DateTime;
  }

  interface InvalidUserId {
    readonly __typename: 'InvalidUserId';
  }

  async function readOnlineStatus(userId: number): Promise<ReadOnlineStatusResult | undefined> {
    return await operateGraphQlApi(
      async () =>
        await queryOrMutate(httpApiConfig, {
          query: `
            query ReadOnlineStatus($userId: Int!) {
              readOnlineStatus(userId: $userId) {
                __typename
                ... on OnlineStatus {
                  userId
                  isOnline
                  lastOnline
                }
              }
            }
          `,
          variables: { userId },
        }),
    );
  }

  export const fetch = createAsyncThunk(`${sliceName}/fetch`, operateReadOnlineStatus, {
    condition: (userId, { getState }) => {
      const { onlineStatuses } = getState() as { onlineStatuses: State };
      return !onlineStatuses.ids.includes(userId) && !onlineStatuses.fetching.includes(userId);
    },
  });

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ fetching: [] }) as State,
    reducers: { upsertOne: adapter.upsertOne, removeOne: adapter.removeOne },
    extraReducers: (builder) => {
      builder
        .addCase(fetch.fulfilled, (state, { payload, meta }) => {
          state.fetching = state.fetching.filter((userId) => userId !== meta.arg);
          if (payload !== undefined) adapter.upsertOne(state, payload);
        })
        .addCase(fetch.pending, (state, { meta }) => {
          state.fetching.push(meta.arg);
        })
        .addCase(fetch.rejected, (state, { meta }) => {
          state.fetching = state.fetching.filter((userId) => userId !== meta.arg);
        });
    },
  });

  export const { reducer } = slice;

  export const { upsertOne, removeOne } = slice.actions;

  /** `undefined` if the status hasn't been fetched yet. */
  export const select = createSelector(
    (state: RootState) => state.onlineStatuses.entities,
    (_: RootState, userId: number) => userId,
    (entities: Dictionary<OnlineStatus>, userId: number) => entities[userId],
  );
}
