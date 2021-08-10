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
  getGroupChatImage,
  getProfileImage,
  ImageFile,
  ImageType,
  NonexistentChatError,
  NonexistentUserIdError,
} from '@neelkamath/omni-chat';
import { RootState } from '../store';
import { httpApiConfig, operateRestApi } from '../../api';

/** Profile and group chat images. */
export namespace ImagesSlice {
  const sliceName = 'images';

  /** `undefined` if it hasn't been fetched yet. `null` if the user doesn't have one. */
  export type ImageUrl = string | null | undefined;

  export type EntityType = 'GROUP_CHAT_IMAGE' | 'PROFILE_IMAGE';

  export interface Entity {
    readonly id: string; // Generated using <generateId()>.
    readonly type: EntityType;
    readonly thumbnailUrl?: ImageUrl;
    readonly originalUrl?: ImageUrl;
    /** Whether this entity is currently being fetched. */
    readonly isLoading: boolean;
    /** If an error was thrown while fetching this entity, this won't be `undefined`. */
    readonly error?: NonexistentUserIdError | NonexistentChatError;
  }

  export interface FetchImageData {
    /**
     * - A user ID if the {@link type} is a `'PROFILE_IMAGE'`.
     * - A group chat ID if the {@link type} is a`'GROUP_CHAT_IMAGE'`.
     */
    readonly id: number;
    readonly type: EntityType;
    /** If `true`, the image will only be fetched if it has already been fetched. */
    readonly shouldUpdateOnly?: boolean;
  }

  const adapter: EntityAdapter<Entity> = createEntityAdapter();

  /**
   * - A {@link ImageFile} is indicative of the image.
   * - `null` indicates the entity doesn't have an associated image.
   * - `undefined` indicates the image hasn't been fetched; perhaps due to an error.
   */
  type ImageResponse = ImageFile | null | undefined;

  interface Image {
    readonly thumbnail: ImageResponse;
    readonly original: ImageResponse;
  }

  /** Generates the {@link Entity.id}. The `id` is the ID of either the user or group chat. */
  function generateId(type: EntityType, id: number): string {
    return `${type}_${id}`;
  }

  async function getImage({ id, type }: FetchImageData): Promise<Image> {
    let thumbnail: ImageResponse, original: ImageResponse;
    switch (type) {
      case 'GROUP_CHAT_IMAGE':
        thumbnail = await operateRestApi(() => getGroupChatImage(httpApiConfig, id, 'THUMBNAIL'));
        original = await operateRestApi(() => getGroupChatImage(httpApiConfig, id, 'ORIGINAL'));
        break;
      case 'PROFILE_IMAGE':
        thumbnail = await operateRestApi(() => getProfileImage(httpApiConfig, id, 'THUMBNAIL'));
        original = await operateRestApi(() => getProfileImage(httpApiConfig, id, 'ORIGINAL'));
    }
    return { thumbnail, original };
  }

  export const fetchImage = createAsyncThunk(
    `${sliceName}/fetchImage`,
    async ({ id, type }: FetchImageData) => {
      const { thumbnail, original } = await getImage({ id, type });
      const generateUrl = (data: ImageResponse) =>
        data === null || data === undefined ? data : URL.createObjectURL(data.blob);
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
        const { images } = getState() as { images: EntityState<Entity> };
        const image = images.entities[generateId(type, id)];
        if (image === undefined) return shouldUpdateOnly !== true;
        if (shouldUpdateOnly === true) return true;
        return (image.originalUrl === undefined || image.thumbnailUrl === undefined) && !image.isLoading;
      },
    },
  );

  type State = ReturnType<typeof adapter.getInitialState>;

  /** Removes the profile image of the specified user. */
  function reduceRemoveAccount(state: Draft<State>, { payload }: PayloadAction<number>): State | void {
    adapter.removeOne(state, generateId('PROFILE_IMAGE', payload));
  }

  const slice = createSlice({
    name: sliceName,
    initialState: adapter.getInitialState(),
    reducers: { removeAccount: reduceRemoveAccount },
    extraReducers: (builder) => {
      builder
        .addCase(fetchImage.rejected, ({ entities }, { meta, error }) => {
          const entity = entities[generateId(meta.arg.type, meta.arg.id)]!;
          entity.isLoading = false;
          if (error.name === NonexistentUserIdError.name) entity.error = new NonexistentUserIdError();
          else if (error.name === NonexistentChatError.name) entity.error = new NonexistentChatError();
        })
        .addCase(fetchImage.fulfilled, adapter.upsertOne)
        .addCase(fetchImage.pending, (state, { meta }) => {
          const id = generateId(meta.arg.type, meta.arg.id);
          adapter.upsertOne(state, { id, type: meta.arg.type, isLoading: true });
        });
    },
  });

  export const { reducer } = slice;

  export const { removeAccount } = slice.actions;

  export const selectImage = createSelector(
    (state: RootState) => state.images.entities,
    (_: RootState, type: EntityType) => type,
    (_state: RootState, _type: EntityType, id: number) => id,
    (_state: RootState, _type: EntityType, _id: number, imageType: ImageType) => imageType,
    (entities: Dictionary<Entity>, type: EntityType, id: number, imageType: ImageType) => {
      const entity = entities[generateId(type, id)];
      switch (imageType) {
        case 'THUMBNAIL':
          return entity?.thumbnailUrl;
        case 'ORIGINAL':
          return entity?.originalUrl;
      }
    },
  );

  /**
   * Returns `undefined` if either the image hasn't been fetched yet or no error occurred when the image was being
   * fetched. Otherwise, it'll either be a {@link NonexistentUserIdError} or {@link NonexistentChatError}.
   */
  export const selectError = createSelector(
    (state: RootState) => state.images.entities,
    (_: RootState, type: EntityType) => type,
    (_state: RootState, _type: EntityType, id: number) => id,
    (entities: Dictionary<Entity>, type: EntityType, id: number) => entities[generateId(type, id)]?.error,
  );
}
