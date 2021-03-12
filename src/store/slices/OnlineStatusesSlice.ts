import { OnlineStatus } from '@neelkamath/omni-chat';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  Dictionary,
  EntityAdapter,
} from '@reduxjs/toolkit';
import { QueriesApiWrapper } from '../../api/QueriesApiWrapper';
import { FetchStatus, RootState } from '../store';

export namespace OnlineStatusesSlice {
  const adapter: EntityAdapter<OnlineStatus> = createEntityAdapter({
    selectId: (model) => model.userId,
  });

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    readonly status: FetchStatus;
  }

  export const fetchStatuses = createAsyncThunk('onlineStatuses/fetchStatuses', QueriesApiWrapper.readOnlineStatuses, {
    condition: (_, { getState }) => {
      const { onlineStatuses } = getState() as { onlineStatuses: State };
      return onlineStatuses.status === 'IDLE';
    },
  });

  const slice = createSlice({
    name: 'onlineStatuses',
    initialState: adapter.getInitialState({ status: 'IDLE' }) as State,
    reducers: { upsertOne: adapter.upsertOne },
    extraReducers: (builder) => {
      builder
        .addCase(fetchStatuses.fulfilled, (state, { payload }) => {
          state.status = 'LOADED';
          if (payload !== undefined) adapter.upsertMany(state, payload);
        })
        .addCase(fetchStatuses.pending, (state) => {
          state.status = 'LOADING';
        })
        .addCase(fetchStatuses.rejected, (state) => {
          state.status = 'IDLE';
        });
    },
  });

  export const { reducer } = slice;

  export const { upsertOne } = slice.actions;

  export const select = createSelector(
    [(state: RootState) => state.onlineStatuses.entities, (_: RootState, userId: number) => userId],
    (entities: Dictionary<OnlineStatus>, userId: number) => entities[userId],
  );
}
