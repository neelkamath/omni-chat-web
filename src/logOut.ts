import * as storage from './storage';

/** Deletes the token set from storage, and opens the login page. */
export function logOut(): void {
    storage.deleteTokenSet();
    location.href = '/sign-in';
}
