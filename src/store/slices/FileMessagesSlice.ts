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
import { AudioFile, DocFile, getAudioMessage, getDocMessage, getVideoMessage, VideoFile } from '@neelkamath/omni-chat';
import { Storage } from '../../Storage';
import { RootState } from '../store';

/** The URLs of audio, video, and doc messages. */
export namespace FileMessagesSlice {
  const sliceName = 'fileMessages';
  const adapter: EntityAdapter<Entity> = createEntityAdapter({ selectId: ({ messageId }) => messageId });

  export interface FileMessage {
    /** `undefined` only if {@link url} is `undefined`. */
    readonly filename?: string;
    readonly url?: string;
  }

  export interface Entity extends FileMessage {
    readonly messageId: number;
    readonly isLoading: boolean;
  }

  export interface MessageMetadata {
    readonly messageId: number;
    readonly type: 'AUDIO' | 'VIDEO' | 'DOC';
  }

  export const fetch = createAsyncThunk(
    `${sliceName}/fetch`,
    async ({ messageId, type }: MessageMetadata) => {
      let file: VideoFile | AudioFile | DocFile | undefined;
      switch (type) {
        case 'VIDEO':
          file = await operateRestApi(() => getVideoMessage(httpApiConfig, Storage.readAccessToken(), messageId));
          break;
        case 'AUDIO':
          file = await operateRestApi(() => getAudioMessage(httpApiConfig, Storage.readAccessToken(), messageId));
          break;
        case 'DOC':
          file = await operateRestApi(() => getDocMessage(httpApiConfig, Storage.readAccessToken(), messageId));
      }
      return {
        messageId,
        filename: file?.filename,
        url: file === undefined ? undefined : URL.createObjectURL(file.blob),
        isLoading: false,
      };
    },
    {
      condition: ({ messageId }, { getState }) => {
        const { fileMessages } = getState() as { fileMessages: EntityState<Entity> };
        const file = fileMessages.entities[messageId];
        return file === undefined || !file.isLoading;
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
          entities[meta.arg.messageId]!.isLoading = false;
        })
        .addCase(fetch.pending, (state, { meta }) => {
          adapter.upsertOne(state, { messageId: meta.arg.messageId, isLoading: true });
        })
        .addCase(fetch.fulfilled, adapter.upsertOne);
    },
  });

  export const { reducer } = slice;

  export const { deleteMessage } = slice.actions;

  /**
   * Returns `true` if either the message hasn't been fetched or is being fetched, and `false` if it has been fetched.
   */
  export const selectIsLoading = createSelector(
    (state: RootState) => state.fileMessages.entities,
    (_: RootState, messageId: number) => messageId,
    (entities: Dictionary<Entity>, messageId: number) => entities[messageId]?.isLoading !== false,
  );

  /**
   * Returns the specified message's doc whose URLs may be `undefined` if they haven't been fetched yet.
   * @see selectIsLoading
   */
  export const selectFile = createSelector(
    (state: RootState) => state.fileMessages.entities,
    (_: RootState, messageId: number) => messageId,
    (entities: Dictionary<Entity>, messageId: number): FileMessage => {
      const entity = entities[messageId];
      return { filename: entity?.filename, url: entity?.url };
    },
  );
}
