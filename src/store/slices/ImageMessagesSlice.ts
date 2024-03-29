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
import { httpApiConfig, operateRestApi } from '../../api';
import { getImageMessage } from '@neelkamath/omni-chat';
import { Storage } from '../../Storage';
import { RootState } from '../store';

/** The URLs of image messages. */
export namespace ImageMessagesSlice {
  const sliceName = 'imageMessages';
  const adapter: EntityAdapter<Entity> = createEntityAdapter({ selectId: ({ messageId }) => messageId });

  export interface Entity extends Image {
    readonly messageId: number;
    readonly isLoading: boolean;
  }

  export interface Image {
    readonly thumbnailUrl?: string;
    readonly originalUrl?: string;
  }

  export const fetchMessage = createAsyncThunk(
    `${sliceName}/fetchMessage`,
    async (messageId: number) => {
      const thumbnail = await operateRestApi(() =>
        getImageMessage(httpApiConfig, Storage.readAccessToken(), messageId, 'THUMBNAIL'),
      );
      const original = await operateRestApi(() =>
        getImageMessage(httpApiConfig, Storage.readAccessToken(), messageId, 'ORIGINAL'),
      );
      return {
        messageId,
        thumbnailUrl: thumbnail === undefined ? undefined : URL.createObjectURL(thumbnail.blob),
        originalUrl: original === undefined ? undefined : URL.createObjectURL(original.blob),
        isLoading: false,
      };
    },
    {
      condition: (messageId, { getState }) => {
        const { imageMessages } = getState() as { imageMessages: EntityState<Entity> };
        const image = imageMessages.entities[messageId];
        if (image === undefined) return true;
        return (image.originalUrl === undefined || image.thumbnailUrl === undefined) && !image.isLoading;
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
        .addCase(fetchMessage.rejected, ({ entities }, { meta }) => {
          entities[meta.arg]!.isLoading = false;
        })
        .addCase(fetchMessage.fulfilled, adapter.upsertOne)
        .addCase(fetchMessage.pending, (state, { meta }) => {
          adapter.upsertOne(state, { messageId: meta.arg, isLoading: true });
        });
    },
  });

  export const { reducer } = slice;

  export const { deleteMessage } = slice.actions;

  /** Returns `true` if either the image hasn't been fetched or is being fetched, and `false` if it has been fetched. */
  export const selectIsLoading = createSelector(
    (state: RootState) => state.imageMessages.entities,
    (_: RootState, messageId: number) => messageId,
    (entities: Dictionary<Entity>, messageId: number) => entities[messageId]?.isLoading !== false,
  );

  /**
   * Returns the specified message's image whose URLs may be `undefined` if they haven't been fetched yet.
   * @see selectIsLoading
   */
  export const selectImage = createSelector(
    (state: RootState) => state.imageMessages.entities,
    (_: RootState, messageId: number) => messageId,
    (entities: Dictionary<Entity>, messageId: number) => {
      const entity = entities[messageId];
      return { thumbnailUrl: entity?.thumbnailUrl, originalUrl: entity?.originalUrl };
    },
  );
}
