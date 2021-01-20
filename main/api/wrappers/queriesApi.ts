import {Account, AccountsConnection, Cursor, Login} from '../networking/graphql/models';
import * as queriesApi from '../networking/graphql/queriesApi';
import {
    ConnectionError,
    IncorrectPasswordError,
    InternalServerError,
    NonexistentUserError,
    PasswordScalarError,
    UnauthorizedError,
    UnverifiedEmailAddressError,
    UsernameScalarError
} from '../networking/errors';
import * as storage from '../../storage';
import {logOut} from '../../logOut';

export async function requestTokenSet(login: Login): Promise<void> {
    let tokenSet;
    try {
        tokenSet = await queriesApi.requestTokenSet(login);
    } catch (error) {
        if (error instanceof UsernameScalarError) await UsernameScalarError.display();
        else if (error instanceof PasswordScalarError) await PasswordScalarError.display();
        else if (error instanceof NonexistentUserError) await NonexistentUserError.display();
        else if (error instanceof UnverifiedEmailAddressError) await UnverifiedEmailAddressError.display();
        else if (error instanceof IncorrectPasswordError) await IncorrectPasswordError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    storage.saveTokenSet(tokenSet);
    location.href = '/chat';
}

/**
 * Ensures the token set saved to {@link localStorage} is always valid. If the currently saved token set either doesn't
 * exist or is invalid, the user will be logged out.
 */
export async function refreshTokenSet(): Promise<void> {
    const refreshToken = storage.readTokenSet()?.refreshToken;
    if (refreshToken === undefined) {
        logOut();
        return;
    }
    let tokenSet;
    try {
        tokenSet = await queriesApi.refreshTokenSet(refreshToken);
    } catch (error) {
        if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) logOut();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    storage.saveTokenSet(tokenSet);
    const fiftyMinutes = 50 * 60 * 1000;
    setTimeout(refreshTokenSet, fiftyMinutes);
}

export async function readAccount(): Promise<Account | null> {
    let account;
    try {
        account = await queriesApi.readAccount(storage.readTokenSet()!.accessToken);
    } catch (error) {
        if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) logOut();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return null;
    }
    return account;
}

export async function searchUsers(query: string, first?: number, after?: Cursor): Promise<AccountsConnection | null> {
    let connection;
    try {
        connection = await queriesApi.searchUsers(query, first, after);
    } catch (error) {
        if (error instanceof ConnectionError) await ConnectionError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else throw error;
        return null;
    }
    return connection;
}
