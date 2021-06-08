import { createSelector, createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export namespace ChatPageLayoutSlice {
  export interface State {
    readonly type: ElementType;
    /** `undefined` unless the {@link type} isn't `'CHAT_SECTION'`. */
    readonly chatId?: number;
  }

  /**
   * - `'EMPTY'` indicates `<Empty />`.
   * - `'BLOCKED_USERS_SECTION'` indicates `<BlockedUsersSection />`.
   * - `'ACCOUNT_EDITOR'` indicates `<AccountEditor />`.
   * - `'CONTACTS_SECTION'` indicates `<ContactsSection />`.
   * - `'SEARCH_USERS_SECTION'` indicates `<SearchUsersSection />`.
   * - `'SUPPORT_SECTION'` indicates `<ChatPageSupportSection />`.
   * - `'DEVELOPERS_SECTION'` indicates `<DevelopersSection />`.
   * - `'CHAT_SECTION'` indicates `<ChatSection />`.
   */
  export type ElementType =
    | 'EMPTY'
    | 'BLOCKED_USERS_SECTION'
    | 'ACCOUNT_EDITOR'
    | 'CONTACTS_SECTION'
    | 'SEARCH_USERS_SECTION'
    | 'SUPPORT_SECTION'
    | 'DEVELOPERS_SECTION'
    | 'CHAT_SECTION'
    | 'CREATE_GROUP_CHAT';

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
