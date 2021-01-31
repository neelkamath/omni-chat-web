import * as subscriptionsApi from '../networking/graphql/subscriptionsApi';
import * as storage from '../../storage';
import {ConnectionError} from '../networking/errors';
import {OnSocketClose, OnSocketMessage} from '../networking/graphql/operator';
import {AccountsSubscription} from '../networking/graphql/models';

export function subscribeToAccounts(onMessage: OnSocketMessage<AccountsSubscription>): OnSocketClose {
    return subscriptionsApi.subscribeToAccounts(
        storage.readTokenSet()!.accessToken!,
        ConnectionError.display,
        onMessage,
    );
}
