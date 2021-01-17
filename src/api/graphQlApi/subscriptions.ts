import {
    CREATED_SUBSCRIPTION_FRAGMENT,
    DELETED_CONTACT_FRAGMENT,
    NEW_CONTACT_FRAGMENT,
    UPDATED_ACCOUNT_FRAGMENT
} from './fragments';
import {OnSocketClose, OnSocketError, OnSocketMessage, subscribe} from './operator';

/**
 * Yields updates on the user's contacts, the subscriber's account, and accounts of users the subscriber has a chat
 * with. The subscription will be stopped if the user deletes their account.
 * @param accessToken
 * @param onError
 * @param onMessage
 */
export function subscribeToAccounts(
    accessToken: string,
    onError: OnSocketError,
    onMessage: OnSocketMessage,
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
                }
            }
        `,
        onError,
        onMessage,
    );
}
