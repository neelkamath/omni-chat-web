import { AsyncThunkAction, configureStore } from '@reduxjs/toolkit';
import { PicsSlice } from './slices/PicsSlice';
import { AccountSlice } from './slices/AccountSlice';
import { SearchedUsersSlice } from './slices/SearchedUsersSlice';
import { BlockedUsersSlice } from './slices/BlockedUsersSlice';
import { ChatsSlice } from './slices/ChatsSlice';
import { OnlineStatusesSlice } from './slices/OnlineStatusesSlice';
import { TypingStatusesSlice } from './slices/TypingStatusesSlice';
import { ContactsSlice } from './slices/ContactsSlice';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { ChatPageLayoutSlice } from './slices/ChatPageLayoutSlice';

/**
 * - `'IDLE'` indicates that either the entities have never been fetched or an error occurred during the last fetch.
 * - `'LOADING'` indicates that the entities are being fetched.
 * - `'LOADED'` indicates that the entities have been fetched.
 */
export type FetchStatus = 'IDLE' | 'LOADING' | 'LOADED';

const store = configureStore({
  reducer: {
    account: AccountSlice.reducer,
    blockedUsers: BlockedUsersSlice.reducer,
    chats: ChatsSlice.reducer,
    contacts: ContactsSlice.reducer,
    onlineStatuses: OnlineStatusesSlice.reducer,
    pics: PicsSlice.reducer,
    searchedUsers: SearchedUsersSlice.reducer,
    typingStatuses: TypingStatusesSlice.reducer,
    chatPageLayout: ChatPageLayoutSlice.reducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

/**
 * @example
 * When using React Redux, the following boilerplate is required to dispatch an action for an async thunk:
 *
 * ```typescript
 * function ProfilePic(): ReactElement {
 *   const dispatch = useDispatch();
 *   useEffect(() => {
 *     dispatch(ChatsSlice.fetchChat(3));
 *   }, [dispatch]);
 * }
 * ```
 *
 * This function removes the boilerplate as shown below:
 *
 * ```typescript
 * function ProfilePic(): ReactElement {
 *   useThunkDispatch(ChatsSlice.fetchChat(3));
 * }
 * ```
 */
export function useThunkDispatch(actionCreator: AsyncThunkAction<any, any, any>): void {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(actionCreator);
  }, [dispatch, actionCreator]);
}
