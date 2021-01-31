import {
    BLOCKED_ACCOUNT_FRAGMENT,
    CREATED_SUBSCRIPTION_FRAGMENT,
    DELETED_CONTACT_FRAGMENT,
    NEW_CONTACT_FRAGMENT,
    UNBLOCKED_ACCOUNT_FRAGMENT,
    UPDATED_ACCOUNT_FRAGMENT
} from './fragments';
import {OnSocketClose, OnSocketError, OnSocketMessage, subscribe} from './operator';
import {AccountsSubscription} from './models';

/**
 * Yields updates on the user's contacts, the subscriber's account, and accounts of users the subscriber has a chat
 * with. The subscription will be stopped if the user deletes their account.
 */
export function subscribeToAccounts(
    accessToken: string,
    onError: OnSocketError,
    onMessage: OnSocketMessage<AccountsSubscription>,
): OnSocketClose {
    return subscribe(
        '/accounts-subscription',
        accessToken,
        `
            subscription SubscribeToAccounts {
                subscribeToAccounts {
                    ${CREATED_SUBSCRIPTION_FRAGMENT}
                    ${NEW_CONTACT_FRAGMENT}
                    ${UPDATED_ACCOUNT_FRAGMENT}
                    ${DELETED_CONTACT_FRAGMENT}
                    ${BLOCKED_ACCOUNT_FRAGMENT}
                    ${UNBLOCKED_ACCOUNT_FRAGMENT}
                }
            }
        `,
        onError,
        onMessage,
    );
}
