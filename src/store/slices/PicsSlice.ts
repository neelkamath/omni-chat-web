import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  Dictionary,
  EntityAdapter,
  EntityState,
} from '@reduxjs/toolkit';
import {
  NonexistentChatError,
  NonexistentUserIdError,
  PicType,
} from '@neelkamath/omni-chat';
import {RestApiWrapper} from '../../api/RestApiWrapper';
import {RootState} from '../store';
import EntityType = PicsSlice.EntityType;

/** Generates the {@link Entity.id}. */
function generateId(type: EntityType, id: number): string {
  return `${type}_${id}`;
}

/** Profile and group chat pics. */
export namespace PicsSlice {
  /**
   * `undefined` if it hasn't been fetched yet. `null` if the user doesn't
   * have one.
   */
  export type PicUrl = string | null | undefined;

  export type EntityType = 'GROUP_CHAT_PIC' | 'PROFILE_PIC';

  export interface Entity {
    readonly id: string; // Generated using <generateId()>.
    readonly type: EntityType;
    readonly thumbnailUrl?: PicUrl;
    readonly originalUrl?: PicUrl;
    /** Whether this entity is currently being fetched. */
    readonly isLoading: boolean;
    /** If an error was thrown while fetching this entity. */
    readonly error?: NonexistentUserIdError | NonexistentChatError;
  }

  export interface PicData {
    /**
     * - A user ID if the {@link type} is a `'PROFILE_PIC'`.
     * - A group chat ID if the {@link type} is a`'GROUP_CHAT_PIC'`.
     */
    readonly id: number;
    readonly type: EntityType;
    /**
     * If `true`, the pic will only be fetched if it has already been
     * fetched.
     */
    readonly shouldUpdateOnly?: boolean;
  }

  const adapter: EntityAdapter<Entity> = createEntityAdapter();

  export const fetchPic = createAsyncThunk(
    'pics/fetchPic',
    async ({id, type}: PicData) => {
      let thumbnail, original;
      switch (type) {
        case 'GROUP_CHAT_PIC':
          thumbnail = await RestApiWrapper.getGroupChatPic(id, 'THUMBNAIL');
          original = await RestApiWrapper.getGroupChatPic(id, 'ORIGINAL');
          break;
        case 'PROFILE_PIC':
          thumbnail = await RestApiWrapper.getProfilePic(id, 'THUMBNAIL');
          original = await RestApiWrapper.getProfilePic(id, 'ORIGINAL');
      }
      const generateUrl = (pic: Blob | null | undefined) =>
        pic instanceof Blob ? URL.createObjectURL(pic) : pic;
      return {
        id: generateId(type, id),
        type,
        thumbnailUrl: generateUrl(thumbnail),
        originalUrl: generateUrl(original),
        isLoading: false,
      };
    },
    {
      condition: ({id, type, shouldUpdateOnly}, {getState}) => {
        const {pics} = getState() as { pics: EntityState<Entity> };
        const pic = pics.entities[generateId(type, id)];
        if (pic === undefined) return shouldUpdateOnly !== true;
        return (
          (pic.originalUrl === undefined || pic.thumbnailUrl === undefined) &&
          !pic.isLoading
        );
      },
    }
  );

  const slice = createSlice({
    name: 'pics',
    initialState: adapter.getInitialState(),
    reducers: {},
    extraReducers: builder => {
      builder
        .addCase(fetchPic.rejected, ({entities}, {meta, error}) => {
          const entity = entities[generateId(meta.arg.type, meta.arg.id)]!;
          entity.isLoading = false;
          if (error.name === NonexistentUserIdError.name)
            entity.error = new NonexistentUserIdError();
          else if (error.name === NonexistentChatError.name)
            entity.error = new NonexistentChatError();
        })
        .addCase(fetchPic.fulfilled, adapter.upsertOne)
        .addCase(fetchPic.pending, (state, {meta}) => {
          const id = generateId(meta.arg.type, meta.arg.id);
          if (state.entities[id] === undefined)
            adapter.addOne(state, {id, type: meta.arg.type, isLoading: true});
        });
    },
  });

  export const {reducer} = slice;

  export const selectPic = createSelector(
    [
      (state: RootState) => state.pics.entities,
      (_: RootState, type: EntityType) => type,
      (_state: RootState, _type: EntityType, id: number) => id,
      (_state: RootState, _type: EntityType, _id: number, picType: PicType) =>
        picType,
    ],
    (
      entities: Dictionary<Entity>,
      type: EntityType,
      id: number,
      picType: PicType
    ) => {
      const entity = entities[generateId(type, id)];
      switch (picType) {
        case 'THUMBNAIL':
          return entity?.originalUrl;
        case 'ORIGINAL':
          return entity?.thumbnailUrl;
      }
    }
  );

  /**
   * @returns `undefined` if either the pic hasn't been fetched yet or no
   * error occurred when the pic was being fetched. Otherwise, it'll either be
   * a {@link NonexistentUserIdError} or {@link NonexistentChatError}.
   */
  export const selectError = createSelector(
    [
      (state: RootState) => state.pics.entities,
      (_: RootState, type: EntityType) => type,
      (_state: RootState, _type: EntityType, id: number) => id,
    ],
    (entities: Dictionary<Entity>, type: EntityType, id: number) =>
      entities[generateId(type, id)]?.error
  );
}
