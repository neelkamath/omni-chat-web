import { Storage } from './Storage';
import { shutDownSubscriptions } from './store/subscriptions';
import setOnline from './setOnline';

export default async function logOut(): Promise<void> {
  await setOnline(false);
  shutDownSubscriptions();
  Storage.deleteTokenSet();
  location.href = '/sign-in';
}
