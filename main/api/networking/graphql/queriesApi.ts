import {Account, AccountsConnection, Chat, Cursor, Login, OnlineStatus, TokenSet} from './models';
import {queryOrMutate} from './operator';
import {
    ACCOUNT_FRAGMENT,
    ACCOUNTS_CONNECTION_FRAGMENT,
    CHAT_FRAGMENT,
    ONLINE_STATUS_FRAGMENT,
    TOKEN_SET_FRAGMENT
} from './fragments';
import {
    ConnectionError,
    IncorrectPasswordError,
    InternalServerError,
    InvalidChatIdError,
    NonexistentUserError,
    UnverifiedEmailAddressError
} from '../errors';
import {validateLogin} from './validators';
import {BackwardPagination, ForwardPagination} from './pagination';

/**
 * Certain operations require authentication via an access token. You can acquire one to authenticate the user by
 * passing their {@link Login} to this operation.
 * @throws {ConnectionError}
 * @throws {NonexistentUserError}
 * @throws {UnverifiedEmailAddressError}
 * @throws {IncorrectPasswordError}
 * @throws {InternalServerError}
 * @throws {UsernameScalarError}
 * @throws {PasswordScalarError}
 * @see refreshTokenSet
 */
export async function requestTokenSet(login: Login): Promise<TokenSet> {
    validateLogin(login);
    const {__typename, ...loginData} = login;
    const response = await queryOrMutate({
        query: `
            query RequestTokenSet($login: Login!) {
                requestTokenSet(login: $login) {
                    ${TOKEN_SET_FRAGMENT}
                }
            }
        `,
        variables: {login: loginData},
    });
    if (response.errors !== undefined) {
        switch (response.errors[0]!.message) {
            case 'NONEXISTENT_USER':
                throw new NonexistentUserError();
            case 'UNVERIFIED_EMAIL_ADDRESS':
                throw new UnverifiedEmailAddressError();
            case 'INCORRECT_PASSWORD':
                throw new IncorrectPasswordError();
            case 'INTERNAL_SERVER_ERROR':
                throw new InternalServerError();
            default:
                throw new ConnectionError();
        }
    }
    return response.data!.requestTokenSet;
}

/**
 * The access token is short-lived. Once it expires, the user would have to log in again. This can be avoided by passing
 * the {@link TokenSet.refreshToken} from {@link requestTokenSet} here to request a new {@link TokenSet}.
 * @throws {UnauthorizedError}
 * @throws {ConnectionError}
 * @throws {InternalServerError}
 */
export async function refreshTokenSet(refreshToken: string): Promise<TokenSet> {
    const response = await queryOrMutate({
        query: `
            query RefreshTokenSet($refreshToken: ID!) {
                refreshTokenSet(refreshToken: $refreshToken) {
                    ${TOKEN_SET_FRAGMENT}
                }
            }
        `,
        variables: {refreshToken},
    });
    if (response.errors !== undefined) {
        if (response.errors[0]!.message === 'INTERNAL_SERVER_ERROR') throw new InternalServerError();
        throw new ConnectionError();
    }
    return response.data!.refreshTokenSet;
}

/**
 * @return The user's account info.
 * @throws {UnauthorizedError}
 * @throws {ConnectionError}
 * @throws {InternalServerError}
 */
export async function readAccount(accessToken: string): Promise<Account> {
    const response = await queryOrMutate({
        query: `
            query ReadAccount {
                readAccount {
                    ${ACCOUNT_FRAGMENT}
                }
            }
        `,
    }, accessToken);
    if (response.errors !== undefined) {
        if (response.errors[0]!.message === 'INTERNAL_SERVER_ERROR') throw new InternalServerError();
        throw new ConnectionError();
    }
    return response.data!.readAccount;
}

/**
 * @param query Case-insensitively matched against users' usernames, email addresses, first names, and last names.
 * @param first
 * @param after
 * @throws {ConnectionError}
 * @throws {InternalServerError}
 */
export async function searchUsers(query: string, first?: number, after?: Cursor): Promise<AccountsConnection> {
    const response = await queryOrMutate({
        query: `
            query SearchUsers($query: String!, $first: Int, $after: Cursor) {
                searchUsers(query: $query, first: $first, after: $after) {
                    ${ACCOUNTS_CONNECTION_FRAGMENT}
                }
            }
        `,
        variables: {query, first, after},
    });
    if (response.errors !== undefined) {
        if (response.errors[0]!.message === 'INTERNAL_SERVER_ERROR') throw new InternalServerError();
        throw new ConnectionError();
    }
    return response.data!.searchUsers;
}

/**
 * Case-insensitively searches contacts using their usernames, first names, last names, and email addresses.
 * @throws {UnauthorizedError}
 * @throws {ConnectionError}
 * @throws {InternalServerError}
 */
export async function searchContacts(
    accessToken: string,
    query: string,
    first?: number,
    after?: Cursor,
): Promise<AccountsConnection> {
    const response = await queryOrMutate({
        query: `
            query SearchContacts($query: String!, $first: Int, $after: Cursor) {
                searchContacts(query: $query, first: $first, after: $after) {
                    ${ACCOUNTS_CONNECTION_FRAGMENT}
                }
            }
        `,
        variables: {query, first, after},
    }, accessToken);
    if (response.errors !== undefined) {
        if (response.errors[0]!.message === 'INTERNAL_SERVER_ERROR') throw new InternalServerError();
        throw new ConnectionError();
    }
    return response.data!.searchContacts;
}

/**
 * Returns users blocked by this user.
 * @throws {UnauthorizedError}
 * @throws {ConnectionError}
 * @throws {InternalServerError}
 */
export async function readBlockedUsers(
    accessToken: string,
    first?: number,
    after?: Cursor,
): Promise<AccountsConnection> {
    const response = await queryOrMutate({
        query: `
            query ReadBlockedUsers($first: Int, $after: Cursor) {
                readBlockedUsers(first: $first, after: $after) {
                    ${ACCOUNTS_CONNECTION_FRAGMENT}
                }
            }
        `,
        variables: {first, after},
    }, accessToken);
    if (response.errors !== undefined) {
        if (response.errors[0]!.message === 'INTERNAL_SERVER_ERROR') throw new InternalServerError();
        throw new ConnectionError();
    }
    return response.data!.readBlockedUsers;
}

/**
 * Whether the user has blocked the user.
 * @throws {UnauthorizedError}
 * @throws {ConnectionError}
 * @throws {InternalServerError}
 */
export async function isBlocked(accessToken: string, userId: number): Promise<boolean> {
    const response = await queryOrMutate({
        query: `
            query IsBlocked($userId: Int!) {
                isBlocked(userId: $userId)
            }
        `,
        variables: {userId},
    }, accessToken);
    if (response.errors !== undefined) {
        if (response.errors[0]!.message === 'INTERNAL_SERVER_ERROR') throw new InternalServerError();
        throw new ConnectionError();
    }
    return response.data!.isBlocked;
}

/**
 * Whether the specified user is in the user's contacts.
 * @throws {UnauthorizedError}
 * @throws {ConnectionError}
 * @throws {InternalServerError}
 */
export async function isContact(accessToken: string, userId: number): Promise<boolean> {
    const response = await queryOrMutate({
        query: `
            query IsContact($userId: Int!) {
                isContact(userId: $userId)
            }
        `,
        variables: {userId},
    }, accessToken);
    if (response.errors !== undefined) {
        if (response.errors[0]!.message === 'INTERNAL_SERVER_ERROR') throw new InternalServerError();
        throw new ConnectionError();
    }
    return response.data!.isContact;
}

/**
 * @param accessToken Must be passed if the chat isn't a public chat.
 * @param id
 * @param privateChatMessagesPagination
 * @param groupChatUsersPagination
 * @param groupChatMessagesPagination
 * @throws {InvalidChatIdError}
 * @throws {UnauthorizedError}
 * @throws {ConnectionError}
 * @throws {InternalServerError}
 */
export async function readChat(
    accessToken: string | undefined,
    id: number,
    privateChatMessagesPagination?: BackwardPagination,
    groupChatUsersPagination?: ForwardPagination,
    groupChatMessagesPagination?: BackwardPagination,
): Promise<Chat> {
    const response = await queryOrMutate({
        query: `
            query ReadChat(
                $id: Int!
                $privateChat_messages_last: Int
                $privateChat_messages_before: Cursor
                $groupChat_users_first: Int
                $groupChat_users_after: Cursor
                $groupChat_messages_last: Int
                $groupChat_messages_before: Cursor
            ) {
                readChat(id: $id) {
                    ${CHAT_FRAGMENT}
                }
            }
        `,
        variables: {
            id,
            privateChat_messages_last: privateChatMessagesPagination?.last,
            privateChat_messages_before: privateChatMessagesPagination?.before,
            groupChat_users_first: groupChatUsersPagination?.first,
            groupChat_users_after: groupChatUsersPagination?.after,
            groupChat_messages_last: groupChatMessagesPagination?.last,
            groupChat_messages_before: groupChatMessagesPagination?.before,
        },
    }, accessToken);
    if (response.errors !== undefined)
        switch (response.errors[0]!.message) {
            case 'INVALID_CHAT_ID':
                throw new InvalidChatIdError();
            case 'INTERNAL_SERVER_ERROR':
                throw new InternalServerError();
            default:
                throw new ConnectionError();
        }
    return response.data!.readChat;
}

/**
 * @return The online statuses of users the user has in their contacts, or has a chat with.
 * @throws {InternalServerError}
 * @throws {ConnectionError}
 * @throws {UnauthorizedError}
 */
export async function readOnlineStatuses(accessToken: string): Promise<OnlineStatus[]> {
    const response = await queryOrMutate({
        query: `
            query ReadOnlineStatuses {
                readOnlineStatuses {
                    ${ONLINE_STATUS_FRAGMENT}
                }
            }
        `,
    }, accessToken);
    if (response.errors !== undefined) {
        if (response.errors[0]!.message === 'INTERNAL_SERVER_ERROR') throw new InternalServerError();
        throw new ConnectionError();
    }
    return response.data!.readOnlineStatuses;
}

/**
 * @return the chats the user is in.
 * @throws {InternalServerError}
 * @throws {ConnectionError}
 * @throws {UnauthorizedError}
 */
export async function readChats(
    accessToken: string,
    privateChatMessagesPagination?: BackwardPagination,
    groupChatUsersPagination?: ForwardPagination,
    groupChatMessagesPagination?: BackwardPagination,
): Promise<Chat[]> {
    const response = await queryOrMutate({
        query: `
            query ReadChats(
                $privateChat_messages_last: Int
                $privateChat_messages_before: Cursor
                $groupChat_users_first: Int
                $groupChat_users_after: Cursor
                $groupChat_messages_last: Int
                $groupChat_messages_before: Cursor
            ) {
                readChats {
                    ${CHAT_FRAGMENT}
                }
            }
        `,
        variables: {
            privateChat_messages_last: privateChatMessagesPagination?.last,
            privateChat_messages_before: privateChatMessagesPagination?.before,
            groupChat_users_first: groupChatUsersPagination?.first,
            groupChat_users_after: groupChatUsersPagination?.after,
            groupChat_messages_last: groupChatMessagesPagination?.last,
            groupChat_messages_before: groupChatMessagesPagination?.before,
        },
    }, accessToken);
    if (response.errors !== undefined) {
        if (response.errors[0]!.message === 'INTERNAL_SERVER_ERROR') throw new InternalServerError();
        throw new ConnectionError();
    }
    return response.data!.readChats;
}
