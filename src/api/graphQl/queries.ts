import {Login, TokenSet} from './models';
import {
    CONNECTION_ERROR,
    INCORRECT_PASSWORD_ERROR,
    NONEXISTENT_USER_ERROR,
    UNVERIFIED_EMAIL_ADDRESS_ERROR
} from '../errors';
import {queryOrMutate} from './operator';
import {TOKEN_SET_FRAGMENT} from './fragments';

/**
 * Certain operations require authentication via an access token. You can acquire one to authenticate the user by
 * passing their {@link Login} to this operation.
 * @param login
 * @throws CONNECTION_ERROR
 * @throws NONEXISTENT_USER_ERROR
 * @throws UNVERIFIED_EMAIL_ADDRESS_ERROR
 * @throws INCORRECT_PASSWORD_ERROR
 * @see refreshTokenSet
 */
export async function requestTokenSet(login: Login): Promise<TokenSet> {
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
    if ('errors' in response) {
        switch (response.errors![0]!.message) {
            case 'NONEXISTENT_USER':
                throw NONEXISTENT_USER_ERROR;
            case 'UNVERIFIED_EMAIL_ADDRESS':
                throw UNVERIFIED_EMAIL_ADDRESS_ERROR;
            case 'INCORRECT_PASSWORD':
                throw INCORRECT_PASSWORD_ERROR;
            default:
                throw CONNECTION_ERROR;
        }
    }
    return response.data!['requestTokenSet'];
}

/**
 * The access token is short-lived. Once it expires, the user would have to log in again. This can be avoided by
 * passing the {@link TokenSet.refreshToken} from {@link requestTokenSet} here to request a new {@link TokenSet}.
 * @param refreshToken
 * @throws UNAUTHORIZED_ERROR
 * @throws CONNECTION_ERROR
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
    if ('errors' in response) throw CONNECTION_ERROR;
    return response.data!['refreshTokenSet'];
}
