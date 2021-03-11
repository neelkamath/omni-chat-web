import {Storage} from './Storage';
import {MutationsApiWrapper} from './api/MutationsApiWrapper';
import {shutDownSubscriptions} from './store/subscriptions';

/**
 * Sets the user's status to offline, unsubscribes from GraphQL subscriptions,
 * deletes the token set from storage, and opens the login page.
 */
export default async function logOut(): Promise<void> {
  await MutationsApiWrapper.setOnline(false);
  shutDownSubscriptions();
  Storage.deleteTokenSet();
  location.href = '/sign-in';
}
