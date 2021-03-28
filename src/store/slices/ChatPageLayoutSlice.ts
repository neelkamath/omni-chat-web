import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
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
   * - `'CHAT_PAGE_SUPPORT_SECTION'` indicates `<ChatPageSupportSection />`.
   * - `'DEVELOPERS_SECTION'` indicates `<DevelopersSection />`.
   * - `'CHAT_SECTION'` indicates `<ChatSection />`.
   */
  export type ElementType =
    | 'EMPTY'
    | 'BLOCKED_USERS_SECTION'
    | 'ACCOUNT_EDITOR'
    | 'CONTACTS_SECTION'
    | 'SEARCH_USERS_SECTION'
    | 'CHAT_PAGE_SUPPORT_SECTION'
    | 'DEVELOPERS_SECTION'
    | 'CHAT_SECTION';

  const slice = createSlice({
    name: 'chatPageLayout',
    initialState: { type: 'EMPTY' } as State,
    reducers: { update: (_, { payload }: PayloadAction<State>) => payload },
  });

  export const { reducer } = slice;

  export const { update } = slice.actions;

  export const select = createSelector(
    (state: RootState) => state.chatPageLayout,
    (state: State) => state,
  );
}
