import { OnSocketClose } from '@neelkamath/omni-chat';
import { subscribeToTypingStatuses } from './subscriptions/subscribeToTypingStatuses';
import { subscribeToOnlineStatuses } from './subscriptions/subscribeToOnlineStatuses';
import { subscribeToMessages } from './subscriptions/subscribeToMessages';
import { subscribeToChats } from './subscriptions/subscribeToChats';
import { subscribeToAccounts } from './subscriptions/subscribeToAccounts';

export type PromiseResolver = (value: void | PromiseLike<void>) => void;

const onAccountsSubscriptionClose: OnSocketClose = () => {};
const onGroupChatsSubscriptionClose: OnSocketClose = () => {};
const onMessagesSubscriptionClose: OnSocketClose = () => {};
const onOnlineStatusesSubscriptionClose: OnSocketClose = () => {};
const onTypingStatusesSubscriptionClose: OnSocketClose = () => {};

export const subscriptionClosers = {
  onAccountsSubscriptionClose,
  onGroupChatsSubscriptionClose,
  onMessagesSubscriptionClose,
  onOnlineStatusesSubscriptionClose,
  onTypingStatusesSubscriptionClose,
};

export function verifySubscriptionCreation(onSubscriptionClose: OnSocketClose): void {
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
    onClose();
  });
}

/*
TODO: There are three types of errors:
 - Unauthorized error: Log the user out.
 - Client/server error (e.g., multiple GraphQL operations were sent but not which one to execute): Report bug.
 - Connection error (e.g., the server connected to was restarted by GCP for maintenance): Tell user to refresh page.
 */
export const onSubscriptionError = console.error;
