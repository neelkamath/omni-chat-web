import { configureStore } from '@reduxjs/toolkit';
import { ImagesSlice } from './slices/ImagesSlice';
import { SearchedUsersSlice } from './slices/SearchedUsersSlice';
import { BlockedUsersSlice } from './slices/BlockedUsersSlice';
import { ChatsSlice } from './slices/ChatsSlice';
import { OnlineStatusesSlice } from './slices/OnlineStatusesSlice';
import { TypingStatusesSlice } from './slices/TypingStatusesSlice';
import { ContactsSlice } from './slices/ContactsSlice';
import { ChatPageLayoutSlice } from './slices/ChatPageLayoutSlice';
import { ImageMessagesSlice } from './slices/ImageMessagesSlice';
import { SearchedPublicChatsSlice } from './slices/SearchedPublicChatsSlice';
import { AccountsSlice } from './slices/AccountsSlice';
import { DocMessagesSlice } from './slices/DocMessagesSlice';
import { VideoMessagesSlice } from './slices/VideoMessagesSlice';

/**
 * - `'IDLE'` indicates that either the entities have never been fetched or an error occurred during the last fetch.
 * - `'LOADING'` indicates that the entities are being fetched.
 * - `'LOADED'` indicates that the entities have been fetched.
 */
export type FetchStatus = 'IDLE' | 'LOADING' | 'LOADED';

const store = configureStore({
  reducer: {
    accounts: AccountsSlice.reducer,
    blockedUsers: BlockedUsersSlice.reducer,
    chats: ChatsSlice.reducer,
    contacts: ContactsSlice.reducer,
    onlineStatuses: OnlineStatusesSlice.reducer,
    images: ImagesSlice.reducer,
    searchedUsers: SearchedUsersSlice.reducer,
    typingStatuses: TypingStatusesSlice.reducer,
    chatPageLayout: ChatPageLayoutSlice.reducer,
    imageMessages: ImageMessagesSlice.reducer,
    docMessages: DocMessagesSlice.reducer,
    searchedPublicChats: SearchedPublicChatsSlice.reducer,
    videoMessages: VideoMessagesSlice.reducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
