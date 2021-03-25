import { Storage } from '../Storage';
import store from './store';
import { AccountSlice } from './slices/AccountSlice';
import { PicsSlice } from './slices/PicsSlice';
import { SearchedContactsSlice } from './slices/SearchedContactsSlice';
import { SearchedUsersSlice } from './slices/SearchedUsersSlice';
import { BlockedUsersSlice } from './slices/BlockedUsersSlice';
import { ChatsSlice } from './slices/ChatsSlice';
import { OnlineStatusesSlice } from './slices/OnlineStatusesSlice';
import { TypingStatusesSlice } from './slices/TypingStatusesSlice';
import { ContactsSlice } from './slices/ContactsSlice';
import {
  OnSocketClose,
  subscribeToAccounts,
  subscribeToGroupChats,
  subscribeToMessages,
  subscribeToOnlineStatuses,
  subscribeToTypingStatuses,
} from '@neelkamath/omni-chat';
import { displayBugReporter, wsApiConfig } from '../api';

// TODO: Test every LOC in this file once the app is complete.
// TODO: Create web notifications of new messages, group chats added to, etc. once the app is complete.

/** `undefined` if no subscription is running. */
type OnSubscriptionClose = OnSocketClose | undefined;

let onAccountsSubscriptionClose: OnSubscriptionClose;
let onGroupChatsSubscriptionClose: OnSubscriptionClose;
let onMessagesSubscriptionClose: OnSubscriptionClose;
let onOnlineStatusesSubscriptionClose: OnSubscriptionClose;
let onTypingStatusesSubscriptionClose: OnSubscriptionClose;

function verifyCreation(onSubscriptionClose: OnSubscriptionClose): void {
  // TODO: Automatically send back the error report instead, and show a ConnectionError instead.
  if (onSubscriptionClose !== undefined) throw new Error("Previous subscription hasn't been closed.");
}

/** Sets up the GraphQL subscriptions to keep the {@link store} up-to-date. */
export async function setUpSubscriptions(): Promise<void> {
  await Promise.all([
    setUpAccountsSubscription(),
    setUpGroupChatsSubscription(),
    setUpMessagesSubscription(),
    setUpOnlineStatusesSubscription(),
    setUpTypingStatusesSubscription(),
  ]);
}

/** Shuts down any open GraphQL subscriptions. */
export function shutDownSubscriptions(): void {
  [
    onAccountsSubscriptionClose,
    onGroupChatsSubscriptionClose,
    onMessagesSubscriptionClose,
    onOnlineStatusesSubscriptionClose,
    onTypingStatusesSubscriptionClose,
  ].forEach((onClose) => {
    if (onClose !== undefined) onClose();
  });
}

/*
TODO: There are three types of errors:
 - Unauthorized error: Log the user out.
 - Client/server error (e.g., multiple GraphQL operations were sent but not which one to execute): Report bug.
 - Connection error (e.g., the server connected to was restarted by GCP for maintenance): Tell user to refresh page.
 */
const onError = console.error;

/** Keeps the {@link store} up-to-date with events from {@link subscribeToAccounts}. */
async function setUpAccountsSubscription(): Promise<void> {
  verifyCreation(onAccountsSubscriptionClose);
  return new Promise((resolve) => {
    onAccountsSubscriptionClose = subscribeToAccounts(
      wsApiConfig,
      Storage.readAccessToken()!,
      async ({ data, errors }) => {
        if (errors !== undefined) await displayBugReporter(errors);
        const message = data?.subscribeToAccounts;
        switch (message?.__typename) {
          case 'CreatedSubscription':
            resolve();
            break;
          case 'UpdatedAccount':
            if (message.id === Storage.readUserId()!) store.dispatch(AccountSlice.update(message));
            store.dispatch(BlockedUsersSlice.updateAccount(message));
            store.dispatch(ChatsSlice.updateAccount(message));
            store.dispatch(ContactsSlice.updateOne(message));
            store.dispatch(SearchedContactsSlice.updateAccount(message));
            store.dispatch(SearchedUsersSlice.update(message));
            break;
          case 'UpdatedProfilePic':
            store.dispatch(PicsSlice.fetchPic({ id: message.id, type: 'PROFILE_PIC', shouldUpdateOnly: true }));
            break;
          case 'BlockedAccount':
            store.dispatch(BlockedUsersSlice.upsertOne(message));
            break;
          case 'DeletedContact':
            store.dispatch(ContactsSlice.removeOne(message));
            break;
          case 'NewContact':
            store.dispatch(ContactsSlice.upsertOne(message));
            break;
          case 'UnblockedAccount':
            store.dispatch(BlockedUsersSlice.removeOne(message));
        }
      },
      onError,
    );
  });
}

/** Keeps the {@link store} up-to-date with events from {@link subscribeToGroupChats}. */
async function setUpGroupChatsSubscription(): Promise<void> {
  verifyCreation(onGroupChatsSubscriptionClose);
  return new Promise((resolve) => {
    onGroupChatsSubscriptionClose = subscribeToGroupChats(
      wsApiConfig,
      Storage.readAccessToken()!,
      async ({ data, errors }) => {
        if (errors !== undefined) await displayBugReporter(errors);
        const message = data?.subscribeToGroupChats;
        switch (message?.__typename) {
          case 'CreatedSubscription':
            resolve();
            break;
          case 'GroupChatId':
            store.dispatch(ChatsSlice.fetchChat(message.id));
            break;
          case 'ExitedUsers':
            if (message.userIdList.includes(Storage.readUserId()!))
              store.dispatch(ChatsSlice.removeOne(message.chatId));
            break;
          case 'UpdatedGroupChat':
            store.dispatch(ChatsSlice.fetchChat(message.chatId));
            break;
          case 'UpdatedGroupChatPic':
            store.dispatch(PicsSlice.fetchPic({ id: message.id, type: 'GROUP_CHAT_PIC', shouldUpdateOnly: true }));
        }
      },
      onError,
    );
  });
}

/** Keeps the {@link store} up-to-date with events from {@link subscribeToMessages}. */
async function setUpMessagesSubscription(): Promise<void> {
  verifyCreation(onMessagesSubscriptionClose);
  return new Promise((resolve) => {
    onMessagesSubscriptionClose = subscribeToMessages(
      wsApiConfig,
      Storage.readAccessToken()!,
      async ({ data, errors }) => {
        if (errors !== undefined) await displayBugReporter(errors);
        const message = data?.subscribeToMessages;
        switch (message?.__typename) {
          case 'CreatedSubscription':
            resolve();
            break;
          case 'UpdatedMessage':
          case 'DeletedMessage':
          case 'DeletionOfEveryMessage':
          case 'MessageDeletionPoint':
          case 'NewActionMessage':
          case 'NewAudioMessage':
          case 'NewDocMessage':
          case 'NewGroupChatInviteMessage':
          case 'NewPicMessage':
          case 'NewPollMessage':
          case 'NewTextMessage':
          case 'NewVideoMessage':
          case 'UserChatMessagesRemoval':
            /*
            TODO: Don't fetch a chat in all these cases. For example, only fetch it if the UpdatedMessage is the latest
             one, and maybe not even then - just update the latest message in the chat instead.
             */
            store.dispatch(ChatsSlice.fetchChat(message.chatId));
        }
      },
      onError,
    );
  });
}

/** Keeps the {@link store} up-to-date with events from {@link subscribeToOnlineStatuses}. */
async function setUpOnlineStatusesSubscription(): Promise<void> {
  verifyCreation(onOnlineStatusesSubscriptionClose);
  return new Promise((resolve) => {
    onOnlineStatusesSubscriptionClose = subscribeToOnlineStatuses(
      wsApiConfig,
      Storage.readAccessToken()!,
      async ({ data, errors }) => {
        if (errors !== undefined) await displayBugReporter(errors);
        const message = data?.subscribeToOnlineStatuses;
        switch (message?.__typename) {
          case 'CreatedSubscription':
            resolve();
            break;
          case 'OnlineStatus':
            store.dispatch(OnlineStatusesSlice.upsertOne({ ...message, __typename: 'OnlineStatus' }));
        }
      },
      onError,
    );
  });
}

/** Keeps the {@link store} up-to-date with events from {@link subscribeToTypingStatuses}. */
async function setUpTypingStatusesSubscription(): Promise<void> {
  verifyCreation(onTypingStatusesSubscriptionClose);
  return new Promise((resolve) => {
    onTypingStatusesSubscriptionClose = subscribeToTypingStatuses(
      wsApiConfig,
      Storage.readAccessToken()!,
      async ({ data, errors }) => {
        if (errors !== undefined) await displayBugReporter(errors);
        const message = data?.subscribeToTypingStatuses;
        switch (message?.__typename) {
          case 'CreatedSubscription':
            resolve();
            break;
          case 'TypingStatus':
            store.dispatch(TypingStatusesSlice.upsertOne(message));
        }
      },
      onError,
    );
  });
}
