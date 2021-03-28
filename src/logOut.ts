import { Storage } from './Storage';
import { shutDownSubscriptions } from './store/subscriptions';
import { httpApiConfig, operateGraphQlApi } from './api';
import { setOnline } from '@neelkamath/omni-chat';

// TODO: Test once Omni Chat Backend 0.18.0 releases.
export default async function logOut(): Promise<void> {
  const token = Storage.readAccessToken();
  if (token !== undefined) await operateGraphQlApi(() => setOnline(httpApiConfig, token, false));
  shutDownSubscriptions();
  Storage.deleteTokenSet();
  location.href = '/sign-in';
}
