import * as storage from './storage';
import * as mutationsApi from './api/wrappers/mutationsApi';

/** Sets the user's status to offline, deletes the token set from storage, and opens the login page. */
export default async function logOut(): Promise<void> {
    await mutationsApi.setOnlineStatus(false);
    storage.deleteTokenSet();
    location.href = '/sign-in';
}
