import { GraphQlResponse, subscribe } from '@neelkamath/omni-chat';
import { displayBugReporter, wsApiConfig } from '../../api';
import store from '../../store/store';
import { OnlineStatusesSlice } from '../../store/slices/OnlineStatusesSlice';
import { Storage } from '../../Storage';
import { onSubscriptionError, PromiseResolver, subscriptionClosers, verifySubscriptionCreation } from '../manager';

interface SubscribeToOnlineStatuses {
  readonly subscribeToOnlineStatuses: CreatedSubscription | OnlineStatus;
}

interface CreatedSubscription {
  readonly __typename: 'CreatedSubscription';
}

interface OnlineStatus {
  readonly __typename: 'OnlineStatus';
  readonly userId: number;
  readonly isOnline: boolean;
}

const query = `
  subscription SubscribeToOnlineStatuses {
    subscribeToOnlineStatuses {
      __typename
      ... on OnlineStatus {
        userId
        isOnline
      }
    }
  }
`;

async function onMessage(
  resolve: PromiseResolver,
  { data, errors }: GraphQlResponse<SubscribeToOnlineStatuses>,
): Promise<void> {
  if (errors !== undefined) await displayBugReporter(errors);
  const event = data?.subscribeToOnlineStatuses;
  switch (event?.__typename) {
    case 'CreatedSubscription':
      resolve();
      break;
    case 'OnlineStatus':
      store.dispatch(OnlineStatusesSlice.upsertOne(event));
  }
}

/** Keeps the {@link store} up-to-date with events from the GraphQL subscription `subscribeToOnlineStatuses`. */
export default async function subscribeToOnlineStatuses(): Promise<void> {
  verifySubscriptionCreation(subscriptionClosers.onOnlineStatusesSubscriptionClose);
  return new Promise((resolve) => {
    subscriptionClosers.onOnlineStatusesSubscriptionClose = subscribe(
      wsApiConfig,
      Storage.readAccessToken()!,
      '/online-statuses-subscription',
      query,
      (response: GraphQlResponse<SubscribeToOnlineStatuses>) => onMessage(resolve, response),
      onSubscriptionError,
    );
  });
}
