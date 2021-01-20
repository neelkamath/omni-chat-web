import * as subscriptionsApi from '../networking/graphql/subscriptionsApi';
import * as storage from '../../storage';
import {ConnectionError} from '../networking/errors';
import {OnSocketClose, OnSocketMessage} from '../networking/graphql/operator';

export function subscribeToAccounts(onMessage: OnSocketMessage): OnSocketClose {
    return subscriptionsApi.subscribeToAccounts(
        storage.readTokenSet()!.accessToken!,
        ConnectionError.display,
        onMessage,
    );
}
