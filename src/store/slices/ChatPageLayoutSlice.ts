import { createSelector, createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export namespace ChatPageLayoutSlice {
  export interface State {
    readonly type: ElementType;
    /** `undefined` unless the {@link type} isn't `'CHAT_SECTION'`. */
    readonly chatId?: number;
  }

  export type ElementType =
    | 'EMPTY'
    | 'BLOCKED_USERS_SECTION'
    | 'ACCOUNT_EDITOR'
    | 'CONTACTS_SECTION'
    | 'SEARCH_USERS_SECTION'
    | 'SUPPORT_SECTION'
    | 'DEVELOPERS_SECTION'
    | 'CHAT_SECTION'
    | 'GROUP_CHAT_CREATOR'
    | 'SEARCH_PUBLIC_CHATS'
    | 'GROUP_CHAT_INFO';

  function reduceUpdate(_: Draft<State>, { payload }: PayloadAction<State>): State | void {
    return payload;
  }

  const slice = createSlice({
    name: 'chatPageLayout',
    initialState: { type: 'EMPTY' } as State,
    reducers: { update: reduceUpdate },
  });

  export const { reducer } = slice;

  export const { update } = slice.actions;

  export const select = createSelector(
    (state: RootState) => state.chatPageLayout,
    (state: State) => state,
  );
}
