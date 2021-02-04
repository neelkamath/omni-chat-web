import {Account, AccountsConnection, Chat, Cursor, Login, OnlineStatus} from '../networking/graphql/models';
import * as queriesApi from '../networking/graphql/queriesApi';
import {
    ConnectionError,
    IncorrectPasswordError,
    InternalServerError,
    InvalidChatIdError,
    NonexistentUserError,
    PasswordScalarError,
    UnauthorizedError,
    UnverifiedEmailAddressError,
    UsernameScalarError
} from '../networking/errors';
import * as storage from '../../storage';
import logOut from '../../logOut';
import {BackwardPagination, ForwardPagination} from '../networking/graphql/pagination';

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
        await logOut();
        return;
    }
    let tokenSet;
    try {
        tokenSet = await queriesApi.refreshTokenSet(refreshToken);
    } catch (error) {
        if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) await logOut();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    storage.saveTokenSet(tokenSet);
    const fiftyMinutes = 50 * 60 * 1000;
    setTimeout(refreshTokenSet, fiftyMinutes);
}

export async function readAccount(): Promise<Account | undefined> {
    try {
        return await queriesApi.readAccount(storage.readTokenSet()!.accessToken);
    } catch (error) {
        if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) await logOut();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return undefined;
    }
}

export async function searchUsers(
    query: string,
    first?: number,
    after?: Cursor,
): Promise<AccountsConnection | undefined> {
    try {
        return await queriesApi.searchUsers(query, first, after);
    } catch (error) {
        if (error instanceof ConnectionError) await ConnectionError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else throw error;
        return undefined;
    }
}

export async function searchContacts(
    query: string,
    first?: number,
    after?: Cursor,
): Promise<AccountsConnection | undefined> {
    try {
        return await queriesApi.searchContacts(storage.readTokenSet()!.accessToken, query, first, after);
    } catch (error) {
        if (error instanceof ConnectionError) await ConnectionError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) await logOut();
        else throw error;
        return undefined;
    }
}

export async function readBlockedUsers(first?: number, after?: Cursor): Promise<AccountsConnection | undefined> {
    try {
        return await queriesApi.readBlockedUsers(storage.readTokenSet()!.accessToken, first, after);
    } catch (error) {
        if (error instanceof ConnectionError) await ConnectionError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) await logOut();
        else throw error;
        return undefined;
    }
}

export async function isBlocked(userId: number): Promise<boolean | undefined> {
    try {
        return queriesApi.isBlocked(storage.readTokenSet()!.accessToken, userId);
    } catch (error) {
        if (error instanceof ConnectionError) await ConnectionError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) await logOut();
        else throw error;
        return undefined;
    }
}

export async function isContact(userId: number): Promise<boolean | undefined> {
    try {
        return await queriesApi.isContact(storage.readTokenSet()!.accessToken, userId);
    } catch (error) {
        if (error instanceof ConnectionError) await ConnectionError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) await logOut();
        else throw error;
        return undefined;
    }
}

export async function readChat(
    id: number,
    privateChatMessagesPagination?: BackwardPagination,
    groupChatUsersPagination?: ForwardPagination,
    groupChatMessagesPagination?: BackwardPagination,
): Promise<Chat | undefined> {
    try {
        return await queriesApi.readChat(
            storage.readTokenSet()!.accessToken,
            id,
            privateChatMessagesPagination,
            groupChatUsersPagination,
            groupChatMessagesPagination,
        );
    } catch (error) {
        if (error instanceof InvalidChatIdError) await InvalidChatIdError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) await logOut();
        else throw error;
        return undefined;
    }
}

export async function readOnlineStatuses(): Promise<OnlineStatus[] | undefined> {
    try {
        return await queriesApi.readOnlineStatuses(storage.readTokenSet()!.accessToken);
    } catch (error) {
        if (error instanceof ConnectionError) await ConnectionError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) await logOut();
        else throw error;
        return undefined;
    }
}

export async function readChats(
    privateChatMessagesPagination?: BackwardPagination,
    groupChatUsersPagination?: ForwardPagination,
    groupChatMessagesPagination?: BackwardPagination,
): Promise<Chat[] | undefined> {
    try {
        return await queriesApi.readChats(
            storage.readTokenSet()!.accessToken,
            privateChatMessagesPagination,
            groupChatUsersPagination,
            groupChatMessagesPagination,
        );
    } catch (error) {
        if (error instanceof ConnectionError) await ConnectionError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) await logOut();
        else throw error;
        return undefined;
    }
}
