import {
    ACCOUNTS_SUBSCRIPTION_FRAGMENT,
    GROUP_CHATS_SUBSCRIPTION_FRAGMENT,
    MESSAGES_SUBSCRIPTION_FRAGMENT,
    ONLINE_STATUSES_SUBSCRIPTION_FRAGMENT,
    TYPING_STATUSES_SUBSCRIPTION_FRAGMENT
} from './fragments';
import {OnSocketClose, OnSocketError, OnSocketMessage, subscribe} from './operator';
import {
    AccountsSubscription,
    GroupChatsSubscription,
    MessagesSubscription,
    OnlineStatusesSubscription,
    TypingStatusesSubscription
} from './models';

/**
 * Yields updates on the user's contacts, the subscriber's account, and accounts of users the subscriber has a chat
 * with. The subscription will be stopped if the user deletes their account.
 */
export function subscribeToAccounts(
    accessToken: string,
    onMessage: OnSocketMessage<AccountsSubscription>,
    onError: OnSocketError,
): OnSocketClose {
    return subscribe(
        accessToken,
        'subscribeToAccounts',
        '/accounts-subscription',
        `
            subscription SubscribeToAccounts {
                subscribeToAccounts {
                    ${ACCOUNTS_SUBSCRIPTION_FRAGMENT}
                }
            }
        `,
        onMessage,
        onError,
    );
}

/**
 * Yields the online statuses of users the user has in their contacts, or has a chat with. The subscription will be
 * stopped if the user deletes their account.
 */
export function subscribeToOnlineStatuses(
    accessToken: string,
    onMessage: OnSocketMessage<OnlineStatusesSubscription>,
    onError: OnSocketError,
): OnSocketClose {
    return subscribe(
        accessToken,
        'subscribeToOnlineStatuses',
        '/online-statuses-subscription',
        `
            subscription SubscribeToOnlineStatuses {
                subscribeToOnlineStatuses {
                    ${ONLINE_STATUSES_SUBSCRIPTION_FRAGMENT}
                }
            }
        `,
        onMessage,
        onError,
    );
}

/**
 * Yields typing statuses for chats the user has. The user's own typing statuses won't be yielded. The subscription
 * will be stopped if the user deletes their account.
 */
export function subscribeToTypingStatuses(
    accessToken: string,
    onMessage: OnSocketMessage<TypingStatusesSubscription>,
    onError: OnSocketError,
): OnSocketClose {
    return subscribe(
        accessToken,
        'subscribeToTypingStatuses',
        '/typing-statuses-subscription',
        `
            subscription SubscribeToTypingStatuses {
                subscribeToTypingStatuses {
                    ${TYPING_STATUSES_SUBSCRIPTION_FRAGMENT}
                }
            }
        `,
        onMessage,
        onError,
    );
}

/**
 * Yields created, updated, and deleted messages (including your own) in every chat the user is in. A message from a
 * chat the user wasn't previously in can be sent as well (e.g., when the other user in a private chat the user deleted
 * sends a message in it). The subscription will be stopped if the user deletes their account.
 */
export function subscribeToMessages(
    accessToken: string,
    onMessage: OnSocketMessage<MessagesSubscription>,
    onError: OnSocketError,
): OnSocketClose {
    return subscribe(
        accessToken,
        'subscribeToMessages',
        '/subscribe-to-messages',
        `
            subscription SubscribeToMessages {
                subscribeToMessages {
                    ${MESSAGES_SUBSCRIPTION_FRAGMENT}
                }
            }
        `,
        onMessage,
        onError,
    );
}

/**
 * Yields group chats the user was added to (including chats they created), and group chat metadata updates. The
 * subscription will be stopped if the user deletes their account.
 */
export function subscribeToGroupChats(
    accessToken: string,
    onMessage: OnSocketMessage<GroupChatsSubscription>,
    onError: OnSocketError,
): OnSocketClose {
    return subscribe(
        accessToken,
        'subscribeToGroupChats',
        '/subscribe-to-group-chats',
        `
            subscription SubscribeToGroupChats {
                subscribeToGroupChats {
                    ${GROUP_CHATS_SUBSCRIPTION_FRAGMENT}
                }
            }
        `,
        onMessage,
        onError,
    );
}
