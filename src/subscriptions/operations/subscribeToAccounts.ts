import { Bio, GraphQlResponse, Name, subscribe, Username } from '@neelkamath/omni-chat';
import { displayBugReporter, wsApiConfig } from '../../api';
import { Storage } from '../../Storage';
import store from '../../store/store';
import { AccountsSlice } from '../../store/slices/AccountsSlice';
import { PicsSlice } from '../../store/slices/PicsSlice';
import { BlockedUsersSlice } from '../../store/slices/BlockedUsersSlice';
import { ContactsSlice } from '../../store/slices/ContactsSlice';
import { ChatsSlice } from '../../store/slices/ChatsSlice';
import { OnlineStatusesSlice } from '../../store/slices/OnlineStatusesSlice';
import { TypingStatusesSlice } from '../../store/slices/TypingStatusesSlice';
import { onSubscriptionError, PromiseResolver, subscriptionClosers, verifySubscriptionCreation } from '../manager';

interface SubscribeToAccountsResult {
  readonly subscribeToAccounts:
    | CreatedSubscription
    | NewContact
    | UpdatedAccount
    | UpdatedProfilePic
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

interface UpdatedProfilePic {
  readonly __typename: 'UpdatedProfilePic';
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
      ... on UpdatedProfilePic {
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
      if (event.userId === Storage.readUserId()!) store.dispatch(AccountsSlice.update(event));
      break;
    case 'UpdatedProfilePic':
      store.dispatch(PicsSlice.fetch({ id: event.userId, type: 'PROFILE_PIC', shouldUpdateOnly: true }));
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
      store.dispatch(BlockedUsersSlice.removeOne(event.userId));
      store.dispatch(ChatsSlice.removePrivateChat(event.userId));
      store.dispatch(OnlineStatusesSlice.removeOne(event.userId));
      store.dispatch(PicsSlice.removeAccount(event.userId));
      store.dispatch(TypingStatusesSlice.removeUser(event.userId));
  }
}

/** Keeps the {@link store} up-to-date with events from the GraphQL subscription `subscribeToAccounts`. */
export async function subscribeToAccounts(): Promise<void> {
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