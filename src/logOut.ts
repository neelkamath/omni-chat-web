import { Storage } from './Storage';
import { shutDownSubscriptions } from './store/subscriptions';
import { httpApiConfig, operateGraphQlApi } from './api';
import { setOnline } from '@neelkamath/omni-chat';

export default async function logOut(setOffline = true): Promise<void> {
  if (setOffline) await operateGraphQlApi(() => setOnline(httpApiConfig, Storage.readAccessToken()!, false));
  shutDownSubscriptions();
  Storage.deleteTokenSet();
  location.href = '/sign-in';
}
