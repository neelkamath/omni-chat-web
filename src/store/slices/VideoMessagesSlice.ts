import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  Dictionary,
  Draft,
  EntityAdapter,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { httpApiConfig } from '../../api';
import { getVideoMessage } from '@neelkamath/omni-chat';
import { Storage } from '../../Storage';
import { RootState } from '../store';

/** The URLs of video messages. */
export namespace VideoMessagesSlice {
  const sliceName = 'videoMessages';
  const adapter: EntityAdapter<Entity> = createEntityAdapter({ selectId: ({ messageId }) => messageId });

  export interface Entity {
    readonly messageId: number;
    readonly url?: string;
    readonly isLoading: boolean;
  }

  export const fetch = createAsyncThunk(
    `${sliceName}/fetch`,
    async (messageId: number) => {
      const { blob } = await getVideoMessage(httpApiConfig, Storage.readAccessToken(), messageId);
      return { messageId, url: URL.createObjectURL(blob), isLoading: false };
    },
    {
      condition: (messageId, { getState }) => {
        const { videoMessages } = getState() as { videoMessages: EntityState<Entity> };
        const video = videoMessages.entities[messageId];
        if (video === undefined) return true;
        return video.url === undefined && !video.isLoading;
      },
    },
  );

  type State = ReturnType<typeof adapter.getInitialState>;

  /** Deletes the specified message. */
  function reduceDeleteMessage(state: Draft<State>, { payload }: PayloadAction<number>): State | void {
    adapter.removeOne(state, payload);
  }

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState(),
    reducers: { deleteMessage: reduceDeleteMessage },
    extraReducers: (builder) => {
      builder
        .addCase(fetch.rejected, ({ entities }, { meta }) => {
          entities[meta.arg]!.isLoading = false;
        })
        .addCase(fetch.fulfilled, adapter.upsertOne)
        .addCase(fetch.pending, (state, { meta }) => {
          adapter.upsertOne(state, { messageId: meta.arg, isLoading: true });
        });
    },
  });

  export const { reducer } = slice;

  export const { deleteMessage } = slice.actions;

  /** Returns `true` if either the video hasn't been fetched or is being fetched, and `false` if it has been fetched. */
  export const selectIsLoading = createSelector(
    (state: RootState) => state.videoMessages.entities,
    (_: RootState, messageId: number) => messageId,
    (entities: Dictionary<Entity>, messageId: number) => entities[messageId]?.isLoading !== false,
  );

  /**
   * Returns the specified message's video whose URLs may be `undefined` if they haven't been fetched yet.
   * @see selectIsLoading
   */
  export const selectVideo = createSelector(
    (state: RootState) => state.videoMessages.entities,
    (_: RootState, messageId: number) => messageId,
    (entities: Dictionary<Entity>, messageId: number) => entities[messageId]?.url,
  );
}
