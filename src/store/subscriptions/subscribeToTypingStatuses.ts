import { GraphQlResponse, subscribe } from '@neelkamath/omni-chat';
import { displayBugReporter, wsApiConfig } from '../../api';
import store from '../store';
import { TypingStatusesSlice } from '../slices/TypingStatusesSlice';
import { Storage } from '../../Storage';
import {
  onSubscriptionError,
  PromiseResolver,
  subscriptionClosers,
  verifySubscriptionCreation,
} from '../subscriptionManager';

interface SubscribeToTypingStatusesResult {
  readonly subscribeToTypingStatuses: CreatedSubscription | TypingStatus;
}

interface CreatedSubscription {
  readonly __typename: 'CreatedSubscription';
}

interface TypingStatus {
  readonly __typename: 'TypingStatus';
  readonly chatId: number;
  readonly userId: number;
  readonly isTyping: boolean;
}

const query = `
  subscription SubscribeToTypingStatuses {
    subscribeToTypingStatuses {
      __typename
      ... on TypingStatus {
        chatId
        userId
        isTyping
      }
    }
  }
`;

async function onMessage(
  resolve: PromiseResolver,
  { data, errors }: GraphQlResponse<SubscribeToTypingStatusesResult>,
): Promise<void> {
  if (errors !== undefined) await displayBugReporter(errors);
  const event = data?.subscribeToTypingStatuses;
  switch (event?.__typename) {
    case 'CreatedSubscription':
      resolve();
      break;
    case 'TypingStatus':
      store.dispatch(TypingStatusesSlice.upsertOne(event));
  }
}

/** Keeps the {@link store} up-to-date with events from the GraphQL subscription `subscribeToTypingStatuses`. */
export async function subscribeToTypingStatuses(): Promise<void> {
  verifySubscriptionCreation(subscriptionClosers.onTypingStatusesSubscriptionClose);
  return new Promise((resolve) => {
    subscriptionClosers.onTypingStatusesSubscriptionClose = subscribe(
      wsApiConfig,
      Storage.readAccessToken()!,
      '/typing-statuses-subscription',
      query,
      (response: GraphQlResponse<SubscribeToTypingStatusesResult>) => onMessage(resolve, response),
      onSubscriptionError,
    );
  });
}
