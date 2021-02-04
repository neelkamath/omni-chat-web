import * as subscriptionsApi from '../networking/graphql/subscriptionsApi';
import * as storage from '../../storage';
import {ConnectionError} from '../networking/errors';
import {OnSocketClose, OnSocketMessage} from '../networking/graphql/operator';
import {
    AccountsSubscription,
    GroupChatsSubscription,
    MessagesSubscription,
    OnlineStatusesSubscription,
    TypingStatusesSubscription
} from '../networking/graphql/models';

export function subscribeToAccounts(onMessage: OnSocketMessage<AccountsSubscription>): OnSocketClose {
    return subscriptionsApi.subscribeToAccounts(
        storage.readTokenSet()!.accessToken!,
        onMessage,
        ConnectionError.display,
    );
}

export function subscribeToOnlineStatuses(onMessage: OnSocketMessage<OnlineStatusesSubscription>): OnSocketClose {
    return subscriptionsApi.subscribeToOnlineStatuses(
        storage.readTokenSet()!.accessToken!,
        onMessage,
        ConnectionError.display,
    );
}

export function subscribeToTypingStatuses(onMessage: OnSocketMessage<TypingStatusesSubscription>): OnSocketClose {
    return subscriptionsApi.subscribeToTypingStatuses(
        storage.readTokenSet()!.accessToken!,
        onMessage,
        ConnectionError.display,
    );
}

export function subscribeToMessages(onMessage: OnSocketMessage<MessagesSubscription>): OnSocketClose {
    return subscriptionsApi.subscribeToMessages(
        storage.readTokenSet()!.accessToken!,
        onMessage,
        ConnectionError.display,
    );
}

export function subscribeToGroupChats(onMessage: OnSocketMessage<GroupChatsSubscription>): OnSocketClose {
    return subscriptionsApi.subscribeToGroupChats(
        storage.readTokenSet()!.accessToken!,
        onMessage,
        ConnectionError.display,
    );
}
