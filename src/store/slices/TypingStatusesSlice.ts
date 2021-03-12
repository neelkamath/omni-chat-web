import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  Dictionary,
  EntityAdapter,
  PayloadAction,
} from '@reduxjs/toolkit';
import {TypingStatus} from '@neelkamath/omni-chat';
import {FetchStatus, RootState} from '../store';
import {QueriesApiWrapper} from '../../api/QueriesApiWrapper';

/** Generates the {@link TypingStatusesSlice.Entity.id} */
function generateId(userId: number, chatId: number): string {
  return `${userId}_${chatId}`;
}

export namespace TypingStatusesSlice {
  export interface Entity {
    readonly id: string; // Generated using <generateId()>.
    readonly isTyping: boolean;
  }

  export interface State extends ReturnType<typeof adapter.getInitialState> {
    readonly status: FetchStatus;
  }

  const adapter: EntityAdapter<Entity> = createEntityAdapter();

  export const fetchStatuses = createAsyncThunk(
    'typingStatuses/fetchStatuses',
    async () => {
      const users = await QueriesApiWrapper.readTypingStatuses();
      return users?.map(status => ({
        ...status,
        id: generateId(status.userId, status.chatId),
      }));
    },
    {
      condition: (_, {getState}) => {
        const {typingStatuses} = getState() as {typingStatuses: State};
        return typingStatuses.status === 'IDLE';
      },
    }
  );

  const slice = createSlice({
    name: 'typingStatuses',
    initialState: adapter.getInitialState({status: 'IDLE'}) as State,
    reducers: {
      upsertOne: (state, {payload}: PayloadAction<TypingStatus>) => {
        const entity = {
          ...payload,
          id: generateId(payload.userId, payload.chatId),
        };
        adapter.upsertOne(state, entity);
      },
    },
    extraReducers: builder => {
      builder
        .addCase(fetchStatuses.rejected, state => {
          state.status = 'IDLE';
        })
        .addCase(fetchStatuses.fulfilled, (state, {payload}) => {
          state.status = 'LOADED';
          if (payload !== undefined) adapter.upsertMany(state, payload);
        })
        .addCase(fetchStatuses.pending, state => {
          state.status = 'LOADING';
        });
    },
  });

  export const {reducer} = slice;

  export const {upsertOne} = slice.actions;

  export const selectIsTyping = createSelector(
    [
      (state: RootState) => state.typingStatuses.entities,
      (_: RootState, userId: number) => userId,
      (_state: RootState, _userId: number, chatId: number) => chatId,
    ],
    (entities: Dictionary<Entity>, userId: number, chatId: number) => {
      return entities[generateId(userId, chatId)]?.isTyping === true;
    }
  );
}
