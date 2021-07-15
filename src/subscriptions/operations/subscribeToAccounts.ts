import { Bio, GraphQlResponse, Name, subscribe, Username } from '@neelkamath/omni-chat';
import { displayBugReporter, wsApiConfig } from '../../api';
import { Storage } from '../../Storage';
import store from '../../store/store';
import { AccountsSlice } from '../../store/slices/AccountsSlice';
import { ImagesSlice } from '../../store/slices/ImagesSlice';
import { BlockedUsersSlice } from '../../store/slices/BlockedUsersSlice';
import { ContactsSlice } from '../../store/slices/ContactsSlice';
import { ChatsSlice } from '../../store/slices/ChatsSlice';
import { OnlineStatusesSlice } from '../../store/slices/OnlineStatusesSlice';
import { TypingStatusesSlice } from '../../store/slices/TypingStatusesSlice';
import { onSubscriptionError, PromiseResolver, subscriptionClosers, verifySubscriptionCreation } from '../manager';
import { SearchedUsersSlice } from '../../store/slices/SearchedUsersSlice';

interface SubscribeToAccountsResult {
  readonly subscribeToAccounts:
    | CreatedSubscription
    | NewContact
    | UpdatedAccount
    | UpdatedProfileImage
    | DeletedContact
    | BlockedAccount
    | UnblockedAccount
    | DeletedAccount;
}

interface UnblockedAccount {
  readonly __typename: 'UnblockedAccount';
  readonly userId: number;
}

interface DeletedAccount {
  readonly __typename: 'DeletedAccount';
  readonly userId: number;
}

interface DeletedContact {
  readonly __typename: 'DeletedContact';
  readonly userId: number;
}

interface BlockedAccount {
  readonly __typename: 'BlockedAccount';
  readonly userId: number;
}

interface UpdatedProfileImage {
  readonly __typename: 'UpdatedProfileImage';
  readonly userId: number;
}

interface CreatedSubscription {
  readonly __typename: 'CreatedSubscription';
}

interface NewContact {
  readonly __typename: 'NewContact';
  readonly userId: number;
}

interface UpdatedAccount {
  readonly __typename: 'UpdatedAccount';
  readonly userId: number;
  readonly username: Username;
  readonly emailAddress: string;
  readonly firstName: Name;
  readonly lastName: Name;
  readonly bio: Bio;
}

const query = `
  subscription SubscribeToAccounts {
    subscribeToAccounts {
      __typename
      ... on UpdatedAccount {
        userId
        username
        emailAddress
        firstName
        lastName
        bio
      }
      ... on UpdatedProfileImage {
        userId
      }
      ... on BlockedAccount {
        userId
      }
      ... on DeletedContact {
        userId
      }
      ... on NewContact {
        userId
      }
      ... on UnblockedAccount {
        userId
      }
      ... on DeletedAccount {
        userId
      }
    }
  }
`;

async function onMessage(
  resolve: PromiseResolver,
  { data, errors }: GraphQlResponse<SubscribeToAccountsResult>,
): Promise<void> {
  if (errors !== undefined) await displayBugReporter(errors);
  const event = data?.subscribeToAccounts;
  switch (event?.__typename) {
    case 'CreatedSubscription':
      resolve();
      break;
    case 'UpdatedAccount':
      store.dispatch(AccountsSlice.update({ ...event, __typename: 'Account' }));
      break;
    case 'UpdatedProfileImage':
      store.dispatch(ImagesSlice.fetch({ id: event.userId, type: 'PROFILE_IMAGE', shouldUpdateOnly: true }));
      break;
    case 'BlockedAccount':
      store.dispatch(BlockedUsersSlice.upsertOne(event));
      break;
    case 'DeletedContact':
      store.dispatch(ContactsSlice.removeOne(event.userId));
      break;
    case 'NewContact':
      store.dispatch(ContactsSlice.upsertOne(event));
      break;
    case 'UnblockedAccount':
      store.dispatch(BlockedUsersSlice.removeOne(event.userId));
      break;
    case 'DeletedAccount':
      store.dispatch(AccountsSlice.removeOne(event.userId));
      store.dispatch(BlockedUsersSlice.removeOne(event.userId));
      store.dispatch(ChatsSlice.removePrivateChat(event.userId));
      store.dispatch(OnlineStatusesSlice.removeOne(event.userId));
      store.dispatch(ImagesSlice.removeAccount(event.userId));
      store.dispatch(TypingStatusesSlice.removeUser(event.userId));
      store.dispatch(SearchedUsersSlice.removeOne(event.userId));
  }
}

/** Keeps the {@link store} up-to-date with events from the GraphQL subscription `subscribeToAccounts`. */
export default async function subscribeToAccounts(): Promise<void> {
  verifySubscriptionCreation(subscriptionClosers.onAccountsSubscriptionClose);
  return new Promise((resolve) => {
    subscriptionClosers.onAccountsSubscriptionClose = subscribe(
      wsApiConfig,
      Storage.readAccessToken()!,
      '/accounts-subscription',
      query,
      (response: GraphQlResponse<SubscribeToAccountsResult>) => onMessage(resolve, response),
      onSubscriptionError,
    );
  });
}
