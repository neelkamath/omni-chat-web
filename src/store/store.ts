import { configureStore } from '@reduxjs/toolkit';
import { PicsSlice } from './slices/PicsSlice';
import { AccountSlice } from './slices/AccountSlice';
import { SearchedUsersSlice } from './slices/SearchedUsersSlice';
import { SearchedContactsSlice } from './slices/SearchedContactsSlice';
import { BlockedUsersSlice } from './slices/BlockedUsersSlice';
import { ChatsSlice } from './slices/ChatsSlice';
import { OnlineStatusesSlice } from './slices/OnlineStatusesSlice';
import { TypingStatusesSlice } from './slices/TypingStatusesSlice';
import { ContactsSlice } from './slices/ContactsSlice';

// TODO: Write tests for slices.

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
    searchedContacts: SearchedContactsSlice.reducer,
    searchedUsers: SearchedUsersSlice.reducer,
    typingStatuses: TypingStatusesSlice.reducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
