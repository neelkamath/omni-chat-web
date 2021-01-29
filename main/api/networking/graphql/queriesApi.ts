import {Account, AccountsConnection, Cursor, Login, TokenSet} from './models';
import {queryOrMutate} from './operator';
import {ACCOUNT_FRAGMENT, ACCOUNTS_CONNECTION_FRAGMENT, TOKEN_SET_FRAGMENT} from './fragments';
import {
    ConnectionError,
    IncorrectPasswordError,
    InternalServerError,
    NonexistentUserError,
    UnverifiedEmailAddressError
} from '../errors';
import {validateLogin} from './validators';

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
    const response = await queryOrMutate({
        query: `
            query RequestTokenSet($login: Login!) {
                requestTokenSet(login: $login) {
                    ${TOKEN_SET_FRAGMENT}
                }
            }
        `,
        variables: {login},
    });
    if (response.errors !== undefined) {
        switch (response.errors![0]!.message) {
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
 * Retrieves saved contacts.
 * @throws {UnauthorizedError}
 * @throws {ConnectionError}
 * @throws {InternalServerError}
 */
export async function readContacts(accessToken: string, first?: number, after?: Cursor): Promise<AccountsConnection> {
    const response = await queryOrMutate({
        query: `
            query ReadContacts($first: Int, $after: Cursor) {
                readContacts(first: $first, after: $after) {
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
    return response.data!.readContacts;
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
