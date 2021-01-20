import {TokenSet} from './api/networking/graphql/models';
import jwtDecode from 'jwt-decode';

interface TokenPayload {
    readonly sub: string;
    readonly exp: number;
}

export function saveTokenSet(tokenSet: TokenSet): void {
    localStorage.setItem('accessToken', tokenSet.accessToken);
    localStorage.setItem('refreshToken', tokenSet.refreshToken);
}

/** @return {TokenSet} if the user has already signed in, and `null` otherwise. */
export function readTokenSet(): TokenSet | null {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken === null || refreshToken === null) return null;
    return {accessToken, refreshToken};
}

/** Deletes the tokens from {@link localStorage}. */
export function deleteTokenSet(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

/** @return If an access token has been saved, the user's ID will be returned. Otherwise, `null` will be returned. */
export function readUserId(): number | null {
    const token = localStorage.getItem('accessToken');
    if (token === null) return null;
    const sub = jwtDecode<TokenPayload>(token).sub;
    return parseInt(sub);
}
