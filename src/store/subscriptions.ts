import { Storage } from '../Storage';
import store from './store';
import { AccountSlice } from './slices/AccountSlice';
import { PicsSlice } from './slices/PicsSlice';
import { BlockedUsersSlice } from './slices/BlockedUsersSlice';
import { ChatsSlice } from './slices/ChatsSlice';
import { OnlineStatusesSlice } from './slices/OnlineStatusesSlice';
import { TypingStatusesSlice } from './slices/TypingStatusesSlice';
import { ContactsSlice } from './slices/ContactsSlice';
import {
  Bio,
  DateTime,
  GraphQlResponse,
  GroupChatDescription,
  GroupChatTitle,
  MessageText,
  Name,
  OnSocketClose,
  subscribe,
  Username,
  Uuid,
} from '@neelkamath/omni-chat';
import { displayBugReporter, wsApiConfig } from '../api';
import { PicMessagesSlice } from './slices/PicMessagesSlice';
import { ChatPageLayoutSlice } from './slices/ChatPageLayoutSlice';
import { message } from 'antd';

// TODO: Maybe split this into multiple files. Make subscriptions smaller by externalizing the query and event handlers.

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
        const event = data?.subscribeToAccounts;
        switch (event?.__typename) {
          case 'CreatedSubscription':
            resolve();
            break;
          case 'UpdatedAccount':
            if (event.userId === Storage.readUserId()!) store.dispatch(AccountSlice.update(event));
            store.dispatch(BlockedUsersSlice.updateAccount(event));
            store.dispatch(ChatsSlice.updateAccount(event));
            store.dispatch(ContactsSlice.updateOne(event));
            break;
          case 'UpdatedProfilePic':
            store.dispatch(PicsSlice.fetchPic({ id: event.userId, type: 'PROFILE_PIC', shouldUpdateOnly: true }));
            break;
          case 'BlockedAccount':
            store.dispatch(BlockedUsersSlice.upsertOne(event));
            break;
          case 'DeletedContact':
            store.dispatch(ContactsSlice.removeOne(event.userId));
            break;
          case 'NewContact':
            store.dispatch(ContactsSlice.upsertOne(event));
            break;
          case 'UnblockedAccount':
            store.dispatch(BlockedUsersSlice.removeOne(event.userId));
            break;
          case 'DeletedAccount':
            store.dispatch(BlockedUsersSlice.removeOne(event.userId));
            store.dispatch(ChatsSlice.removePrivateChat(event.userId));
            store.dispatch(OnlineStatusesSlice.removeOne(event.userId));
            store.dispatch(PicsSlice.removeAccount(event.userId));
            store.dispatch(TypingStatusesSlice.removeUser(event.userId));
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
  readonly title: GroupChatTitle | null;
  readonly description: GroupChatDescription | null;
  readonly newUsers: UpdatedGroupChatAccount[] | null;
  readonly removedUsers: UpdatedGroupChatAccount[] | null;
  readonly adminIdList: number[] | null;
  readonly isBroadcast: boolean | null;
  readonly publicity: GroupChatPublicity | null;
}

interface UpdatedGroupChatAccount {
  readonly userId: number;
  readonly username: Username;
  readonly firstName: Name;
  readonly lastName: Name;
  readonly bio: Bio;
  readonly emailAddress: string;
}

export type GroupChatPublicity = 'INVITABLE' | 'NOT_INVITABLE' | 'PUBLIC';

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
              title
              description
              newUsers {
                userId
                username
                firstName
                lastName
                emailAddress
                bio
              }
              removedUsers {
                userId
              }
              adminIdList
              isBroadcast
              publicity
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
        const event = data?.subscribeToChats;
        switch (event?.__typename) {
          case 'CreatedSubscription':
            resolve();
            break;
          case 'GroupChatId':
            store.dispatch(ChatsSlice.fetchChat(event.chatId));
            break;
          case 'ExitedUsers':
            store.dispatch(ChatsSlice.removeGroupChatUsers(event));
            if (event.userIdList.includes(Storage.readUserId()!)) {
              store.dispatch(ChatsSlice.removeOne(event.chatId));
              if (ChatPageLayoutSlice.select(store.getState()).chatId === event.chatId) {
                message.info("You're no longer in this chat.", 5);
                store.dispatch(ChatPageLayoutSlice.update({ type: 'EMPTY' }));
              }
            }
            break;
          case 'UpdatedGroupChat':
            store.dispatch(ChatsSlice.updateGroupChat(event));
            break;
          case 'UpdatedGroupChatPic':
            store.dispatch(PicsSlice.fetchPic({ id: event.chatId, type: 'GROUP_CHAT_PIC', shouldUpdateOnly: true }));
            break;
          case 'DeletedPrivateChat':
            ChatsSlice.removeOne(event.chatId);
            if (ChatPageLayoutSlice.select(store.getState()).chatId === event.chatId) {
              message.info('The other user just deleted their account.', 5);
              store.dispatch(ChatPageLayoutSlice.update({ type: 'EMPTY' }));
            }
        }
      },
      onError,
    );
  });
}

interface SubscribeToMessagesResult {
  readonly subscribeToMessages:
    | CreatedSubscription
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

interface NewMessage {
  readonly __typename:
    | 'NewActionMessage'
    | 'NewAudioMessage'
    | 'NewDocMessage'
    | 'NewGroupChatInviteMessage'
    | 'NewPicMessage'
    | 'NewPollMessage'
    | 'NewTextMessage'
    | 'NewVideoMessage';
  readonly chatId: number;
  readonly messageId: number;
  readonly sent: DateTime;
  readonly sender: Sender;
  readonly state: MessageState;
}

export type MessageState = 'SENT' | 'DELIVERED' | 'READ';

interface Sender {
  readonly userId: number;
  readonly username: Username;
}

interface NewTextMessage extends NewMessage {
  readonly __typename: 'NewTextMessage';
  readonly textMessage: MessageText;
}

interface NewActionMessage extends NewMessage {
  readonly __typename: 'NewActionMessage';
  readonly actionableMessage: ActionableMessage;
}

interface ActionableMessage {
  readonly text: MessageText;
  readonly actions: MessageText[];
}

interface NewPicMessage extends NewMessage {
  readonly __typename: 'NewPicMessage';
  readonly caption: MessageText;
}

interface NewAudioMessage extends NewMessage {
  readonly __typename: 'NewAudioMessage';
}

interface NewGroupChatInviteMessage extends NewMessage {
  readonly __typename: 'NewGroupChatInviteMessage';
  readonly inviteCode: Uuid;
}

interface NewDocMessage extends NewMessage {
  readonly __typename: 'NewDocMessage';
}

interface NewVideoMessage extends NewMessage {
  readonly __typename: 'NewVideoMessage';
}

interface NewPollMessage extends NewMessage {
  readonly __typename: 'NewPollMessage';
  readonly poll: Poll;
}

interface Poll {
  readonly title: MessageText;
  readonly options: PollOption[];
}

interface PollOption {
  readonly option: MessageText;
  readonly votes: VoterAccount[];
}

interface VoterAccount {
  readonly userId: number;
}

interface DeletedMessage {
  readonly __typename: 'DeletedMessage';
  readonly chatId: number;
  readonly messageId: number;
}

interface UserChatMessagesRemoval {
  readonly __typename: 'UserChatMessagesRemoval';
  readonly chatId: number;
  readonly userId: number;
}

/** Keeps the {@link store} up-to-date with events from the GraphQL subscription `subscribeToMessages`. */
async function subscribeToMessages(): Promise<void> {
  verifyCreation(onMessagesSubscriptionClose);
  return new Promise((resolve) => {
    onMessagesSubscriptionClose = subscribe(
      wsApiConfig,
      Storage.readAccessToken()!,
      '/messages-subscription',
      // TODO: Instead of duplicating account info everywhere, use a slice which gets users from their ID.
      `
        subscription SubscribeToMessages {
          subscribeToMessages {
            __typename
            ... on DeletedMessage {
              chatId
              messageId
            }
            ... on NewMessage {
              chatId
              messageId
              sent
              sender {
                username
                userId
              }
              state
            }
            ... on NewTextMessage {
              textMessage
            }
            ... on NewActionMessage {
              actionableMessage {
                text
                actions
              }
            }
            ... on NewPicMessage {
              caption
            }
            ... on NewPollMessage {
              poll {
                title
                options {
                  option
                  votes {
                    userId
                  }
                }
              }
            }
            ... on NewGroupChatInviteMessage {
              inviteCode
            }
            ... on UserChatMessagesRemoval {
              chatId
              userId
            }
          }
        }
      `,
      async ({ data, errors }: GraphQlResponse<SubscribeToMessagesResult>) => {
        if (errors !== undefined) await displayBugReporter(errors);
        const event = data?.subscribeToMessages;
        switch (event?.__typename) {
          case 'CreatedSubscription':
            resolve();
            break;
          case 'DeletedMessage':
            store.dispatch(ChatsSlice.deleteMessage(event));
            store.dispatch(PicMessagesSlice.deleteMessage(event.messageId));
            break;
          case 'UserChatMessagesRemoval':
            store.dispatch(ChatsSlice.removeUserChatMessages(event));
            break;
          case 'NewActionMessage':
          case 'NewAudioMessage':
          case 'NewDocMessage':
          case 'NewGroupChatInviteMessage':
          case 'NewPicMessage':
          case 'NewPollMessage':
          case 'NewTextMessage':
          case 'NewVideoMessage':
            store.dispatch(ChatsSlice.addMessage(event));
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
        const event = data?.subscribeToOnlineStatuses;
        switch (event?.__typename) {
          case 'CreatedSubscription':
            resolve();
            break;
          case 'OnlineStatus':
            store.dispatch(OnlineStatusesSlice.upsertOne(event));
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
        const event = data?.subscribeToTypingStatuses;
        switch (event?.__typename) {
          case 'CreatedSubscription':
            resolve();
            break;
          case 'TypingStatus':
            store.dispatch(TypingStatusesSlice.upsertOne(event));
        }
      },
      onError,
    );
  });
}
