import { Storage } from './Storage';
import { MutationsApiWrapper } from './api/MutationsApiWrapper';
import { shutDownSubscriptions } from './store/subscriptions';

export default async function logOut(mustSetOffline = true): Promise<void> {
  if (mustSetOffline) await MutationsApiWrapper.setOnline(false);
  shutDownSubscriptions();
  Storage.deleteTokenSet();
  location.href = '/sign-in';
}
