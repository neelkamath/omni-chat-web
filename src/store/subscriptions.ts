import { Storage } from '../Storage';
import store from './store';
import { AccountSlice } from './slices/AccountSlice';
import { PicsSlice } from './slices/PicsSlice';
import { BlockedUsersSlice } from './slices/BlockedUsersSlice';
import { ChatsSlice } from './slices/ChatsSlice';
import { OnlineStatusesSlice } from './slices/OnlineStatusesSlice';
import { TypingStatusesSlice } from './slices/TypingStatusesSlice';
import { ContactsSlice } from './slices/ContactsSlice';
import { Bio, DateTime, GraphQlResponse, Name, OnSocketClose, subscribe, Username } from '@neelkamath/omni-chat';
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
    subscribeToAccounts(),
    subscribeToChats(),
    subscribeToMessages(),
    subscribeToOnlineStatuses(),
    subscribeToTypingStatuses(),
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

interface SubscribeToAccountsResult {
  readonly subscribeToAccounts:
    | CreatedSubscription
    | NewContact
    | UpdatedAccount
    | UpdatedProfilePic
    | DeletedContact
    | BlockedAccount
    | UnblockedAccount
    | DeletedAccount;
}

interface UnblockedAccount {
  readonly __typename: 'UnblockedAccount';
  readonly userId: number;
}

interface DeletedAccount {
  readonly __typename: 'DeletedAccount';
  readonly userId: number;
}

interface DeletedContact {
  readonly __typename: 'DeletedContact';
  readonly userId: number;
}

interface BlockedAccount {
  readonly __typename: 'BlockedAccount';
  readonly userId: number;
  readonly username: Username;
  readonly emailAddress: string;
  readonly firstName: Name;
  readonly lastName: Name;
  readonly bio: Bio;
}

interface UpdatedProfilePic {
  readonly __typename: 'UpdatedProfilePic';
  readonly userId: number;
}

interface CreatedSubscription {
  readonly __typename: 'CreatedSubscription';
}

interface NewContact {
  readonly __typename: 'NewContact';
  readonly userId: number;
}

interface UpdatedAccount {
  readonly __typename: 'UpdatedAccount';
  readonly userId: number;
  readonly username: Username;
  readonly emailAddress: string;
  readonly firstName: Name;
  readonly lastName: Name;
  readonly bio: Bio;
}

/** Keeps the {@link store} up-to-date with events from the GraphQL subscription `subscribeToAccounts`. */
async function subscribeToAccounts(): Promise<void> {
  verifyCreation(onAccountsSubscriptionClose);
  return new Promise((resolve) => {
    onAccountsSubscriptionClose = subscribe(
      wsApiConfig,
      Storage.readAccessToken()!,
      '/accounts-subscription',
      `
        subscription SubscribeToAccounts {
          subscribeToAccounts {
            __typename
            ... on UpdatedAccount {
              userId
              username
              emailAddress
              firstName
              lastName
              bio
            }
            ... on UpdatedProfilePic {
              userId
            }
            ... on BlockedAccount {
              userId
              username
              emailAddress
              firstName
              lastName
              bio
            }
            ... on DeletedContact {
              userId
            }
            ... on NewContact {
              userId
            }
            ... on UnblockedAccount {
              userId
            }
            ... on DeletedAccount {
              userId
            }
          }
        }
      `,
      async ({ data, errors }: GraphQlResponse<SubscribeToAccountsResult>) => {
        if (errors !== undefined) await displayBugReporter(errors);
        const message = data?.subscribeToAccounts;
        switch (message?.__typename) {
          case 'CreatedSubscription':
            resolve();
            break;
          case 'UpdatedAccount':
            if (message.userId === Storage.readUserId()!) store.dispatch(AccountSlice.update(message));
            store.dispatch(BlockedUsersSlice.updateAccount(message));
            store.dispatch(ChatsSlice.updateAccount(message));
            store.dispatch(ContactsSlice.updateOne(message));
            break;
          case 'UpdatedProfilePic':
            store.dispatch(PicsSlice.fetchPic({ id: message.userId, type: 'PROFILE_PIC', shouldUpdateOnly: true }));
            break;
          case 'BlockedAccount':
            store.dispatch(BlockedUsersSlice.upsertOne(message));
            break;
          case 'DeletedContact':
            store.dispatch(ContactsSlice.removeOne(message.userId));
            break;
          case 'NewContact':
            store.dispatch(ContactsSlice.upsertOne(message));
            break;
          case 'UnblockedAccount':
            store.dispatch(BlockedUsersSlice.removeOne(message.userId));
            break;
          case 'DeletedAccount':
            store.dispatch(BlockedUsersSlice.removeOne(message.userId));
            store.dispatch(ChatsSlice.removePrivateChat(message.userId));
            store.dispatch(OnlineStatusesSlice.removeOne(message.userId));
            store.dispatch(PicsSlice.removeAccount(message.userId));
            store.dispatch(TypingStatusesSlice.removeUser(message.userId));
        }
      },
      onError,
    );
  });
}

interface SubscribeToChatsResult {
  readonly subscribeToChats:
    | CreatedSubscription
    | GroupChatId
    | UpdatedGroupChatPic
    | UpdatedGroupChat
    | ExitedUsers
    | DeletedPrivateChat;
}

interface DeletedPrivateChat {
  readonly __typename: 'DeletedPrivateChat';
  readonly chatId: number;
}

interface GroupChatId {
  readonly __typename: 'GroupChatId';
  readonly chatId: number;
}

interface UpdatedGroupChatPic {
  readonly __typename: 'UpdatedGroupChatPic';
  readonly chatId: number;
}

interface UpdatedGroupChat {
  readonly __typename: 'UpdatedGroupChat';
  readonly chatId: number;
}

interface ExitedUsers {
  readonly __typename: 'ExitedUsers';
  readonly chatId: number;
  readonly userIdList: number[];
}

/** Keeps the {@link store} up-to-date with events from the GraphQL subscription `subscribeToChats`. */
async function subscribeToChats(): Promise<void> {
  verifyCreation(onGroupChatsSubscriptionClose);
  return new Promise((resolve) => {
    onGroupChatsSubscriptionClose = subscribe(
      wsApiConfig,
      Storage.readAccessToken()!,
      '/chats-subscription',
      `
        subscription SubscribeToChats {
          subscribeToChats {
            __typename
            ... on GroupChatId {
              chatId
            }
            ... on ExitedUsers {
              chatId
              userIdList
            }
            ... on UpdatedGroupChat {
              chatId
            }
            ... on UpdatedGroupChatPic {
              chatId
            }
            ... on DeletedPrivateChat {
              chatId
            }
          }
        }
      `,
      async ({ data, errors }: GraphQlResponse<SubscribeToChatsResult>) => {
        if (errors !== undefined) await displayBugReporter(errors);
        const message = data?.subscribeToChats;
        switch (message?.__typename) {
          case 'CreatedSubscription':
            resolve();
            break;
          case 'GroupChatId':
            store.dispatch(ChatsSlice.fetchChat(message.chatId));
            break;
          case 'ExitedUsers':
            if (message.userIdList.includes(Storage.readUserId()!))
              store.dispatch(ChatsSlice.removeOne(message.chatId));
            break;
          case 'UpdatedGroupChat':
            store.dispatch(ChatsSlice.fetchChat(message.chatId));
            break;
          case 'UpdatedGroupChatPic':
            store.dispatch(PicsSlice.fetchPic({ id: message.chatId, type: 'GROUP_CHAT_PIC', shouldUpdateOnly: true }));
            break;
          case 'DeletedPrivateChat':
            ChatsSlice.removeOne(message.chatId); // TODO: Test once deleting private chats is implemented.
        }
      },
      onError,
    );
  });
}

interface SubscribeToMessagesResult {
  readonly subscribeToMessages:
    | CreatedSubscription
    | UpdatedMessage
    | DeletedMessage
    | UserChatMessagesRemoval
    | NewActionMessage
    | NewAudioMessage
    | NewDocMessage
    | NewGroupChatInviteMessage
    | NewPicMessage
    | NewPollMessage
    | NewTextMessage
    | NewVideoMessage;
}

interface NewTextMessage {
  readonly __typename: 'NewTextMessage';
  readonly chatId: number;
}

interface NewActionMessage {
  readonly __typename: 'NewActionMessage';
  readonly chatId: number;
}

interface NewPicMessage {
  readonly __typename: 'NewPicMessage';
  readonly chatId: number;
}

interface NewAudioMessage {
  readonly __typename: 'NewAudioMessage';
  readonly chatId: number;
}

interface NewGroupChatInviteMessage {
  readonly __typename: 'NewGroupChatInviteMessage';
  readonly chatId: number;
}

interface NewDocMessage {
  readonly __typename: 'NewDocMessage';
  readonly chatId: number;
}

interface NewVideoMessage {
  readonly __typename: 'NewVideoMessage';
  readonly chatId: number;
}

interface NewPollMessage {
  readonly __typename: 'NewPollMessage';
  readonly chatId: number;
}

interface UpdatedMessage {
  readonly __typename: 'UpdatedMessage';
  readonly chatId: number;
}

interface DeletedMessage {
  readonly __typename: 'DeletedMessage';
  readonly chatId: number;
}

interface UserChatMessagesRemoval {
  readonly __typename: 'UserChatMessagesRemoval';
  readonly chatId: number;
}

/** Keeps the {@link store} up-to-date with events from the GraphQL subscription `subscribeToMessages`. */
async function subscribeToMessages(): Promise<void> {
  verifyCreation(onMessagesSubscriptionClose);
  return new Promise((resolve) => {
    onMessagesSubscriptionClose = subscribe(
      wsApiConfig,
      Storage.readAccessToken()!,
      '/messages-subscription',
      `
        subscription SubscribeToMessages {
          subscribeToMessages {
            __typename
            ... on UpdatedMessage {
              chatId
            }
            ... on DeletedMessage {
              chatId
            }
            ... on NewActionMessage {
              chatId
            }
            ... on NewAudioMessage {
              chatId
            }
            ... on NewDocMessage {
              chatId
            }
            ... on NewGroupChatInviteMessage {
              chatId
            }
            ... on NewPicMessage {
              chatId
            }
            ... on NewPollMessage {
              chatId
            }
            ... on NewTextMessage {
              chatId
            }
            ... on NewVideoMessage {
              chatId
            }
            ... on UserChatMessagesRemoval {
              chatId
            }
          }
        }
      `,
      async ({ data, errors }: GraphQlResponse<SubscribeToMessagesResult>) => {
        if (errors !== undefined) await displayBugReporter(errors);
        const message = data?.subscribeToMessages;
        switch (message?.__typename) {
          case 'CreatedSubscription':
            resolve();
            break;
          case 'UpdatedMessage':
          case 'DeletedMessage':
          case 'UserChatMessagesRemoval':
          case 'NewActionMessage':
          case 'NewAudioMessage':
          case 'NewDocMessage':
          case 'NewGroupChatInviteMessage':
          case 'NewPicMessage':
          case 'NewPollMessage':
          case 'NewTextMessage':
          case 'NewVideoMessage':
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

interface SubscribeToOnlineStatuses {
  readonly subscribeToOnlineStatuses: CreatedSubscription | OnlineStatus;
}

interface OnlineStatus {
  readonly __typename: 'OnlineStatus';
  readonly userId: number;
  readonly isOnline: boolean;
  readonly lastOnline: DateTime;
}

/** Keeps the {@link store} up-to-date with events from the GraphQL subscription `subscribeToOnlineStatuses`. */
async function subscribeToOnlineStatuses(): Promise<void> {
  verifyCreation(onOnlineStatusesSubscriptionClose);
  return new Promise((resolve) => {
    onOnlineStatusesSubscriptionClose = subscribe(
      wsApiConfig,
      Storage.readAccessToken()!,
      '/online-statuses-subscription',
      `
        subscription SubscribeToOnlineStatuses {
          subscribeToOnlineStatuses {
            __typename
            ... on OnlineStatus {
              userId
              isOnline
              lastOnline
            }
          }
        }
      `,
      async ({ data, errors }: GraphQlResponse<SubscribeToOnlineStatuses>) => {
        if (errors !== undefined) await displayBugReporter(errors);
        const message = data?.subscribeToOnlineStatuses;
        switch (message?.__typename) {
          case 'CreatedSubscription':
            resolve();
            break;
          case 'OnlineStatus':
            store.dispatch(OnlineStatusesSlice.upsertOne(message));
        }
      },
      onError,
    );
  });
}

interface SubscribeToTypingStatusesResult {
  readonly subscribeToTypingStatuses: CreatedSubscription | TypingStatus;
}

interface TypingStatus {
  readonly __typename: 'TypingStatus';
  readonly chatId: number;
  readonly userId: number;
  readonly isTyping: boolean;
}

/** Keeps the {@link store} up-to-date with events from the GraphQL subscription `subscribeToTypingStatuses`. */
async function subscribeToTypingStatuses(): Promise<void> {
  verifyCreation(onTypingStatusesSubscriptionClose);
  return new Promise((resolve) => {
    onTypingStatusesSubscriptionClose = subscribe(
      wsApiConfig,
      Storage.readAccessToken()!,
      '/typing-statuses-subscription',
      `
        subscription SubscribeToTypingStatuses {
          subscribeToTypingStatuses {
            __typename
            ... on TypingStatus {
              chatId
              userId
              isTyping
            }
          }
        }
      `,
      async ({ data, errors }: GraphQlResponse<SubscribeToTypingStatusesResult>) => {
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
