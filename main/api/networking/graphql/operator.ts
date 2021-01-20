import {ConnectionError, InternalServerError, UnauthorizedError} from '../errors';

export interface GraphQlRequest {
    readonly query: string;
    readonly variables?: object;
}

export interface GraphQlResponse {
    readonly data?: GraphQlData;
    readonly errors?: GraphQlError[];
}

export interface GraphQlData {
    readonly [key: string]: any;
}

export interface GraphQlError {
    readonly message: string;

    readonly [key: string]: any;
}

/**
 * Executes a GraphQL query or mutation.
 * @throws {UnauthorizedError}
 * @throws {InternalServerError} if the HTTP status code was in the range of 500-599.
 * @throws {ConnectionError} if the HTTP status code wasn't 200, 401, or in the range of 500-599.
 */
export async function queryOrMutate(request: GraphQlRequest, accessToken?: string): Promise<GraphQlResponse> {
    const headers: Record<string, string> = {'Content-Type': 'application/json'};
    if (accessToken !== undefined) headers.Authorization = `Bearer ${accessToken}`;
    const response = await fetch(`${process.env.HTTP}${process.env.API_URL}/query-or-mutation`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
    });
    if (response.status === 401) throw new UnauthorizedError();
    if (response.status >= 500 && response.status < 600) throw new InternalServerError();
    if (response.status !== 200) throw new ConnectionError();
    return await response.json();
}

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
export function subscribe(
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
