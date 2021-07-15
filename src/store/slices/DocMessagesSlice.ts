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
import { getDocMessage } from '@neelkamath/omni-chat';
import { Storage } from '../../Storage';
import { RootState } from '../store';

/** The URLs of doc messages. */
export namespace DocMessagesSlice {
  const sliceName = 'docMessages';
  const adapter: EntityAdapter<Entity> = createEntityAdapter({ selectId: ({ messageId }) => messageId });

  export interface DocFile {
    /** `undefined` only if {@link url} is `undefined`. */
    readonly filename?: string;
    readonly url?: string;
  }

  export interface Entity extends DocFile {
    readonly messageId: number;
    readonly isLoading: boolean;
  }

  export const fetch = createAsyncThunk(
    `${sliceName}/fetch`,
    async (messageId: number) => {
      const doc = await operateRestApi(() => getDocMessage(httpApiConfig, Storage.readAccessToken(), messageId));
      return {
        messageId,
        filename: doc?.filename,
        url: doc === undefined ? undefined : URL.createObjectURL(doc.blob),
        isLoading: false,
      };
    },
    {
      condition: (messageId, { getState }) => {
        const { docMessages } = getState() as { docMessages: EntityState<Entity> };
        const doc = docMessages.entities[messageId];
        return doc === undefined || !doc.isLoading;
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
        .addCase(fetch.pending, (state, { meta }) => {
          adapter.upsertOne(state, { messageId: meta.arg, isLoading: true });
        })
        .addCase(fetch.fulfilled, adapter.upsertOne);
    },
  });

  export const { reducer } = slice;

  export const { deleteMessage } = slice.actions;

  /** Returns `true` if either the doc hasn't been fetched or is being fetched, and `false` if it has been fetched. */
  export const selectIsLoading = createSelector(
    (state: RootState) => state.docMessages.entities,
    (_: RootState, messageId: number) => messageId,
    (entities: Dictionary<Entity>, messageId: number) => entities[messageId]?.isLoading !== false,
  );

  /**
   * Returns the specified message's doc whose URLs may be `undefined` if they haven't been fetched yet.
   * @see selectIsLoading
   */
  export const selectFile = createSelector(
    (state: RootState) => state.docMessages.entities,
    (_: RootState, messageId: number) => messageId,
    (entities: Dictionary<Entity>, messageId: number): DocFile => {
      const entity = entities[messageId];
      return { filename: entity?.filename, url: entity?.url };
    },
  );
}
