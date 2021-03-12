import {SubscriptionsApiWrapper} from '../api/SubscriptionsApiWrapper';
import {Storage} from '../Storage';
import store from './store';
import {AccountSlice} from './slices/AccountSlice';
import {PicsSlice} from './slices/PicsSlice';
import {SearchedContactsSlice} from './slices/SearchedContactsSlice';
import {SearchedUsersSlice} from './slices/SearchedUsersSlice';
import {BlockedUsersSlice} from './slices/BlockedUsersSlice';
import {ChatsSlice} from './slices/ChatsSlice';
import {OnlineStatusesSlice} from './slices/OnlineStatusesSlice';
import {TypingStatusesSlice} from './slices/TypingStatusesSlice';
import {ContactsSlice} from './slices/ContactsSlice';
import {OnSocketClose} from '@neelkamath/omni-chat';

// TODO: Create web notifications of new messages, group chats added to, etc.

/** `undefined` if no subscription is running. */
type OnSubscriptionClose = OnSocketClose | undefined;

let onAccountsSubscriptionClose: OnSubscriptionClose;

let onGroupChatsSubscriptionClose: OnSubscriptionClose;

let onMessagesSubscriptionClose: OnSubscriptionClose;

let onOnlineStatusesSubscriptionClose: OnSubscriptionClose;

let onTypingStatusesSubscriptionClose: OnSubscriptionClose;

function verifyCreation(onSubscriptionClose: OnSubscriptionClose): void {
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
  ].forEach(onClose => {
    if (onClose !== undefined) onClose();
  });
}

/**
 * Keeps the {@link store} up-to-date with events from
 * {@link SubscriptionsApiWrapper.subscribeToAccounts}.
 */
async function setUpAccountsSubscription(): Promise<void> {
  verifyCreation(onAccountsSubscriptionClose);
  return new Promise(resolve => {
    onAccountsSubscriptionClose = SubscriptionsApiWrapper.subscribeToAccounts(message => {
      switch (message.__typename) {
        case 'CreatedSubscription':
          resolve(undefined);
          break;
        case 'UpdatedAccount':
          if (message.id === Storage.readUserId()!) store.dispatch(AccountSlice.update(message));
          store.dispatch(BlockedUsersSlice.updateAccount(message));
          store.dispatch(ContactsSlice.updateOne(message));
          store.dispatch(SearchedContactsSlice.updateAccount(message));
          store.dispatch(SearchedUsersSlice.update(message));
          break;
        case 'UpdatedProfilePic':
          store.dispatch(
            PicsSlice.fetchPic({
              id: message.id,
              type: 'PROFILE_PIC',
              shouldUpdateOnly: true,
            })
          );
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
    });
  });
}

/**
 * Keeps the {@link store} up-to-date with events from
 * {@link SubscriptionsApiWrapper.subscribeToGroupChats}.
 */
async function setUpGroupChatsSubscription(): Promise<void> {
  verifyCreation(onGroupChatsSubscriptionClose);
  return new Promise(resolve => {
    onGroupChatsSubscriptionClose = SubscriptionsApiWrapper.subscribeToGroupChats(message => {
      switch (message.__typename) {
        case 'CreatedSubscription':
          resolve();
          break;
        case 'GroupChatId':
          store.dispatch(ChatsSlice.fetchChat(message.id));
          break;
        case 'ExitedUser':
          if (message.userId === Storage.readUserId()) store.dispatch(ChatsSlice.removeOne(message.chatId));
          break;
        case 'UpdatedGroupChat':
          store.dispatch(ChatsSlice.fetchChat(message.chatId));
          break;
        case 'UpdatedGroupChatPic':
          store.dispatch(
            PicsSlice.fetchPic({
              id: message.id,
              type: 'GROUP_CHAT_PIC',
              shouldUpdateOnly: true,
            })
          );
      }
    });
  });
}

/**
 * Keeps the {@link store} up-to-date with events from
 * {@link SubscriptionsApiWrapper.subscribeToMessages}.
 */
async function setUpMessagesSubscription(): Promise<void> {
  verifyCreation(onMessagesSubscriptionClose);
  return new Promise(resolve => {
    onMessagesSubscriptionClose = SubscriptionsApiWrapper.subscribeToMessages(message => {
      switch (message.__typename) {
        case 'CreatedSubscription':
          resolve();
          break;
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
          store.dispatch(ChatsSlice.fetchChat(message.chatId));
      }
    });
  });
}

/**
 * Keeps the {@link store} up-to-date with events from
 * {@link SubscriptionsApiWrapper.subscribeToOnlineStatuses}.
 */
async function setUpOnlineStatusesSubscription(): Promise<void> {
  verifyCreation(onOnlineStatusesSubscriptionClose);
  return new Promise(resolve => {
    onOnlineStatusesSubscriptionClose = SubscriptionsApiWrapper.subscribeToOnlineStatuses(message => {
      switch (message.__typename) {
        case 'CreatedSubscription':
          resolve();
          break;
        case 'UpdatedOnlineStatus':
          store.dispatch(
            OnlineStatusesSlice.upsertOne({
              ...message,
              __typename: 'OnlineStatus',
              lastOnline: new Date().toISOString(),
            })
          );
      }
    });
  });
}

/**
 * Keeps the {@link store} up-to-date with events from
 * {@link SubscriptionsApiWrapper.subscribeToTypingStatuses}.
 */
async function setUpTypingStatusesSubscription(): Promise<void> {
  verifyCreation(onTypingStatusesSubscriptionClose);
  return new Promise(resolve => {
    onTypingStatusesSubscriptionClose = SubscriptionsApiWrapper.subscribeToTypingStatuses(message => {
      switch (message.__typename) {
        case 'CreatedSubscription':
          resolve();
          break;
        case 'TypingStatus':
          store.dispatch(TypingStatusesSlice.upsertOne(message));
      }
    });
  });
}
