import {
    CREATED_SUBSCRIPTION_FRAGMENT,
    DELETED_CONTACT_FRAGMENT,
    NEW_CONTACT_FRAGMENT,
    UPDATED_ACCOUNT_FRAGMENT
} from './fragments';
import {GraphQlResponse} from './operator';

/**
 * Executed when the socket closes due to an unexpected error. An example use case is displaying a message notifying the
 * user that the server is currently unreachable.
 */
export interface OnSocketError {
    (): void;
}

/**
 * Every time the socket sends an update, this will be called with the data.
 *
 * For example, if the socket sends the following update:
 * ```
 * {
 *     "data": {
 *         "subscribeToMessages": {
 *             "__typename": "NewTextMessage",
 *             "chatId": 3,
 *             "message": "Hi!"
 *         }
 *     }
 * }
 * ```
 * then, the following data would be passed to this function:
 * ```
 * {
 *     '__typename': 'NewTextMessage',
 *     'chatId': 3,
 *     'message': 'Hi!',
 * }
 * ```
 */
export interface OnSocketMessage {
    (message: GraphQlSubscriptionData): void;
}

export interface GraphQlSubscriptionData {
    readonly __typename: string;

    readonly [key: string]: any;
}

/** Call this function to close the connection. */
export interface OnSocketClose {
    (): void;
}

/**
 * Creates a GraphQL subscription.
 * @param path For example, if the subscription is hosted on http://localhost/accounts-subscription, this should be
 * `/accounts-subscription`.
 * @param accessToken
 * @param query GraphQL document (i.e., the query to send to the GraphQL server).
 * @param onError
 * @param onMessage
 */
function subscribe(
    path: string,
    accessToken: string,
    query: string,
    onError: OnSocketError,
    onMessage: OnSocketMessage,
): OnSocketClose {
    const socket = new WebSocket(process.env.WS! + process.env.API_URL! + path);
    socket.addEventListener('open', () => {
        socket.send(accessToken);
        socket.send(JSON.stringify({query}));
    });
    socket.addEventListener('message', (message) => {
        const response = JSON.parse(message.data) as GraphQlResponse;
        if (response.errors !== undefined) {
            onError();
            socket.close();
        } else onMessage(response.data!.subscribeToAccounts);
    });
    socket.addEventListener('error', onError);
    return () => socket.close();
}

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
