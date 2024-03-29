import { OnSocketClose } from '@neelkamath/omni-chat';
import subscribeToTypingStatuses from './operations/subscribeToTypingStatuses';
import subscribeToOnlineStatuses from './operations/subscribeToOnlineStatuses';
import subscribeToMessages from './operations/subscribeToMessages';
import subscribeToChats from './operations/subscribeToChats';
import subscribeToAccounts from './operations/subscribeToAccounts';

export type PromiseResolver = (value: void | PromiseLike<void>) => void;

/** `undefined` if no subscription is running. */
type OnSubscriptionClose = OnSocketClose | undefined;

let onAccountsSubscriptionClose: OnSubscriptionClose;
let onGroupChatsSubscriptionClose: OnSubscriptionClose;
let onMessagesSubscriptionClose: OnSubscriptionClose;
let onOnlineStatusesSubscriptionClose: OnSubscriptionClose;
let onTypingStatusesSubscriptionClose: OnSubscriptionClose;

export const subscriptionClosers: Record<string, OnSubscriptionClose> = {
  onAccountsSubscriptionClose,
  onGroupChatsSubscriptionClose,
  onMessagesSubscriptionClose,
  onOnlineStatusesSubscriptionClose,
  onTypingStatusesSubscriptionClose,
};

/*
If the user is signed in on the chat page, then there will be open WebSocket connections. If they then manually change
the URL to leave the chat page, and sign in again, the application would crash because the previous connections hadn't
been closed.
 */
addEventListener('hashchange', () => {
  if (location.hash !== '#/chat') shutDownSubscriptions();
});

export function verifySubscriptionCreation(onSubscriptionClose: OnSubscriptionClose): void {
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
  for (const onClose in subscriptionClosers) {
    if (subscriptionClosers[onClose] === undefined) continue;
    subscriptionClosers[onClose]!();
    subscriptionClosers[onClose] = undefined;
  }
}

/*
TODO: There are three types of errors:
 - Unauthorized error: Log the user out.
 - Client/server error (e.g., multiple GraphQL operations were sent but not which one to execute): Report bug.
 - Connection error (e.g., the server connected to was restarted by GCP for maintenance): Tell user to refresh page.
 */
export const onSubscriptionError = console.error;
