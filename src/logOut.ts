import { Storage } from './Storage';
import { shutDownSubscriptions } from './subscriptions/manager';
import setOnline from './setOnline';

/** You may want to `setOnlineStatus` to `false` if the access token is invalid because then an error would occur. */
export default async function logOut(setOnlineStatus = true): Promise<void> {
  if (setOnlineStatus) await setOnline(false);
  shutDownSubscriptions();
  Storage.deleteTokenSet();
  location.href = '/#/sign-in';
}
