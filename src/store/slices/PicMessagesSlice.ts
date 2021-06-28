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
import { getPicMessage } from '@neelkamath/omni-chat';
import { Storage } from '../../Storage';
import { RootState } from '../store';

/** The URLs of picture messages. */
export namespace PicMessagesSlice {
  const sliceName = 'picMessages';
  const adapter: EntityAdapter<Entity> = createEntityAdapter({ selectId: ({ messageId }) => messageId });

  export interface Entity extends Pic {
    readonly messageId: number;
    readonly isLoading: boolean;
  }

  export interface Pic {
    readonly thumbnailUrl?: string;
    readonly originalUrl?: string;
  }

  export const fetch = createAsyncThunk(
    `${sliceName}/fetch`,
    async (messageId: number) => {
      const thumbnail = await operateRestApi(() =>
        getPicMessage(httpApiConfig, Storage.readAccessToken(), messageId, 'THUMBNAIL'),
      );
      const original = await operateRestApi(() =>
        getPicMessage(httpApiConfig, Storage.readAccessToken(), messageId, 'ORIGINAL'),
      );
      return {
        messageId,
        thumbnailUrl: thumbnail === undefined ? undefined : URL.createObjectURL(thumbnail),
        originalUrl: original === undefined ? undefined : URL.createObjectURL(original),
        isLoading: false,
      };
    },
    {
      condition: (messageId, { getState }) => {
        const { picMessages } = getState() as { picMessages: EntityState<Entity> };
        const pic = picMessages.entities[messageId];
        if (pic === undefined) return true;
        return (pic.originalUrl === undefined || pic.thumbnailUrl === undefined) && !pic.isLoading;
      },
    },
  );

  type State = ReturnType<typeof adapter.getInitialState>;

  /** Deletes the specified pic message. */
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

  /** Returns `true` if either the pic hasn't been fetched or is being fetched, and `false` if it has been fetched. */
  export const selectIsLoading = createSelector(
    (state: RootState) => state.picMessages.entities,
    (_: RootState, messageId: number) => messageId,
    (entities: Dictionary<Entity>, messageId: number) => entities[messageId]?.isLoading !== false,
  );

  /**
   * Returns the specified message's pic whose URLs may be `undefined` if they haven't been fetched yet.
   * @see selectIsLoading
   */
  export const selectPic = createSelector(
    (state: RootState) => state.picMessages.entities,
    (_: RootState, messageId: number) => messageId,
    (entities: Dictionary<Entity>, messageId: number) => {
      const entity = entities[messageId];
      return { thumbnailUrl: entity?.thumbnailUrl, originalUrl: entity?.originalUrl };
    },
  );
}
