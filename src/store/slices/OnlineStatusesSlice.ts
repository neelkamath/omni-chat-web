import { OnlineStatus, readOnlineStatus } from '@neelkamath/omni-chat';
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

async function operateReadOnlineStatus(userId: number): Promise<OnlineStatus | undefined> {
  const result = await operateGraphQlApi(() => readOnlineStatus(httpApiConfig, userId));
  return result?.readOnlineStatus.__typename === 'InvalidUserId' ? undefined : result?.readOnlineStatus;
}

export namespace OnlineStatusesSlice {
  const adapter: EntityAdapter<OnlineStatus> = createEntityAdapter({ selectId: (model) => model.userId });

  const sliceName = 'onlineStatuses';

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    /** The IDs of users whose statuses are currently being fetched. */
    readonly fetching: number[];
  }

  export const fetchStatus = createAsyncThunk(`${sliceName}/fetchStatus`, operateReadOnlineStatus, {
    condition: (userId, { getState }) => {
      const { onlineStatuses } = getState() as { onlineStatuses: State };
      return !onlineStatuses.ids.includes(userId) && !onlineStatuses.fetching.includes(userId);
    },
  });

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState({ fetching: [] }) as State,
    reducers: { upsertOne: adapter.upsertOne },
    extraReducers: (builder) => {
      builder
        .addCase(fetchStatus.fulfilled, (state, { payload, meta }) => {
          state.fetching = state.fetching.filter((userId) => userId !== meta.arg);
          if (payload !== undefined) adapter.upsertOne(state, payload);
        })
        .addCase(fetchStatus.pending, (state, { meta }) => {
          state.fetching.push(meta.arg);
        })
        .addCase(fetchStatus.rejected, (state, { meta }) => {
          state.fetching = state.fetching.filter((userId) => userId !== meta.arg);
        });
    },
  });

  export const { reducer } = slice;

  export const { upsertOne } = slice.actions;

  /** `undefined` if the status hasn't been fetched yet. */
  export const select = createSelector(
    [(state: RootState) => state.onlineStatuses.entities, (_: RootState, userId: number) => userId],
    (entities: Dictionary<OnlineStatus>, userId: number) => entities[userId],
  );
}
