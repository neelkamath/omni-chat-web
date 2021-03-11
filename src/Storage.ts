import jwtDecode from 'jwt-decode';
import {TokenSet} from '@neelkamath/omni-chat';

export namespace Storage {
  interface TokenPayload {
    readonly sub: string;
    readonly exp: number;
  }

  export function saveTokenSet(tokenSet: TokenSet): void {
    localStorage.setItem('accessToken', tokenSet.accessToken);
    localStorage.setItem('refreshToken', tokenSet.refreshToken);
  }

  /**
   * @return {@link TokenSet} if the user has already signed in, and
   * `undefined` otherwise.
   */
  export function readTokenSet(): TokenSet | undefined {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken === null || refreshToken === null) return undefined;
    return {__typename: 'TokenSet', accessToken, refreshToken};
  }

  /** Deletes the tokens from {@link localStorage}. */
  export function deleteTokenSet(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * @return If an access token has been saved, the user's ID will be
   * returned, and `undefined` otherwise.
   */
  export function readUserId(): number | undefined {
    const token = localStorage.getItem('accessToken');
    if (token === null) return undefined;
    const sub = jwtDecode<TokenPayload>(token).sub;
    return parseInt(sub);
  }
}
