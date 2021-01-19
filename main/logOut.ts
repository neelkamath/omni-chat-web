import {Storage} from './storage';

/** Deletes the token set from storage, and opens the login page. */
export function logOut(): void {
    Storage.deleteTokenSet();
    location.href = '/sign-in';
}
