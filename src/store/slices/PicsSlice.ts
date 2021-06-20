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
import {
  getGroupChatPic,
  getProfilePic,
  NonexistentChatError,
  NonexistentUserIdError,
  PicType,
} from '@neelkamath/omni-chat';
import { RootState } from '../store';
import { Storage } from '../../Storage';
import { httpApiConfig, operateRestApi } from '../../api';

/** Profile and group chat pics. */
export namespace PicsSlice {
  const sliceName = 'pics';

  /** `undefined` if it hasn't been fetched yet. `null` if the user doesn't have one. */
  export type PicUrl = string | null | undefined;

  export type EntityType = 'GROUP_CHAT_PIC' | 'PROFILE_PIC';

  export interface Entity {
    readonly id: string; // Generated using <generateId()>.
    readonly type: EntityType;
    readonly thumbnailUrl?: PicUrl;
    readonly originalUrl?: PicUrl;
    /** Whether this entity is currently being fetched. */
    readonly isLoading: boolean;
    /** If an error was thrown while fetching this entity, this won't be `undefined`. */
    readonly error?: NonexistentUserIdError | NonexistentChatError;
  }

  export interface FetchPicData {
    /**
     * - A user ID if the {@link type} is a `'PROFILE_PIC'`.
     * - A group chat ID if the {@link type} is a`'GROUP_CHAT_PIC'`.
     */
    readonly id: number;
    readonly type: EntityType;
    /** If `true`, the pic will only be fetched if it has already been fetched. */
    readonly shouldUpdateOnly?: boolean;
  }

  const adapter: EntityAdapter<Entity> = createEntityAdapter();

  /**
   * - A {@link Blob} is indicative of the pic.
   * - `null` indicates the entity doesn't have an associated pic.
   * - `undefined` indicates the pic hasn't been fetched; perhaps due to an error.
   */
  type PicData = Blob | null | undefined;

  interface Pic {
    readonly thumbnail: PicData;
    readonly original: PicData;
  }

  /** Generates the {@link Entity.id}. The `id` is the ID of either the user or group chat. */
  function generateId(type: EntityType, id: number): string {
    return `${type}_${id}`;
  }

  async function getPic({ id, type }: FetchPicData): Promise<Pic> {
    let thumbnail: PicData, original: PicData;
    switch (type) {
      case 'GROUP_CHAT_PIC':
        thumbnail = await operateRestApi(() =>
          getGroupChatPic(httpApiConfig, Storage.readAccessToken()!, id, 'THUMBNAIL'),
        );
        original = await operateRestApi(() =>
          getGroupChatPic(httpApiConfig, Storage.readAccessToken()!, id, 'ORIGINAL'),
        );
        break;
      case 'PROFILE_PIC':
        thumbnail = await operateRestApi(() => getProfilePic(httpApiConfig, id, 'THUMBNAIL'));
        original = await operateRestApi(() => getProfilePic(httpApiConfig, id, 'ORIGINAL'));
    }
    return { thumbnail, original };
  }

  export const fetch = createAsyncThunk(
    `${sliceName}/fetch`,
    async ({ id, type }: FetchPicData) => {
      const { thumbnail, original } = await getPic({ id, type });
      const generateUrl = (data: PicData) => (data instanceof Blob ? URL.createObjectURL(data) : data);
      return {
        id: generateId(type, id),
        type,
        thumbnailUrl: generateUrl(thumbnail),
        originalUrl: generateUrl(original),
        isLoading: false,
      };
    },
    {
      condition: ({ id, type, shouldUpdateOnly }, { getState }) => {
        const { pics } = getState() as { pics: EntityState<Entity> };
        const pic = pics.entities[generateId(type, id)];
        if (pic === undefined) return shouldUpdateOnly !== true;
        if (shouldUpdateOnly === true) return true;
        return (pic.originalUrl === undefined || pic.thumbnailUrl === undefined) && !pic.isLoading;
      },
    },
  );

  type State = ReturnType<typeof adapter.getInitialState>;

  /** Removes the profile pic of the specified user. */
  function reduceRemoveAccount(state: Draft<State>, { payload }: PayloadAction<number>): State | void {
    adapter.removeOne(state, generateId('PROFILE_PIC', payload));
  }

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState(),
    reducers: { removeAccount: reduceRemoveAccount },
    extraReducers: (builder) => {
      builder
        .addCase(fetch.rejected, ({ entities }, { meta, error }) => {
          const entity = entities[generateId(meta.arg.type, meta.arg.id)]!;
          entity.isLoading = false;
          if (error.name === NonexistentUserIdError.name) entity.error = new NonexistentUserIdError();
          else if (error.name === NonexistentChatError.name) entity.error = new NonexistentChatError();
        })
        .addCase(fetch.fulfilled, adapter.upsertOne)
        .addCase(fetch.pending, (state, { meta }) => {
          const id = generateId(meta.arg.type, meta.arg.id);
          if (state.entities[id] === undefined) adapter.upsertOne(state, { id, type: meta.arg.type, isLoading: true });
        });
    },
  });

  export const { reducer } = slice;

  export const { removeAccount } = slice.actions;

  export const selectPic = createSelector(
    (state: RootState) => state.pics.entities,
    (_: RootState, type: EntityType) => type,
    (_state: RootState, _type: EntityType, id: number) => id,
    (_state: RootState, _type: EntityType, _id: number, picType: PicType) => picType,
    (entities: Dictionary<Entity>, type: EntityType, id: number, picType: PicType) => {
      const entity = entities[generateId(type, id)];
      switch (picType) {
        case 'THUMBNAIL':
          return entity?.thumbnailUrl;
        case 'ORIGINAL':
          return entity?.originalUrl;
      }
    },
  );

  /**
   * Returns `undefined` if either the pic hasn't been fetched yet or no error occurred when the pic was being fetched.
   * Otherwise, it'll either be a {@link NonexistentUserIdError} or {@link NonexistentChatError}.
   */
  export const selectError = createSelector(
    (state: RootState) => state.pics.entities,
    (_: RootState, type: EntityType) => type,
    (_state: RootState, _type: EntityType, id: number) => id,
    (entities: Dictionary<Entity>, type: EntityType, id: number) => entities[generateId(type, id)]?.error,
  );
}
