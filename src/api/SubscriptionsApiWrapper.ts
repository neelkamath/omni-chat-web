import {Storage} from '../Storage';
import {displayConnectionError} from './errorHandlers';
import {
  AccountsSubscription,
  GroupChatsSubscription,
  MessagesSubscription,
  OnlineStatusesSubscription,
  OnSocketClose,
  OnSocketMessage,
  SubscriptionsApi,
  TypingStatusesSubscription,
  WebSocketProtocol,
} from '@neelkamath/omni-chat';

export namespace SubscriptionsApiWrapper {
  const subscriptionsApi = new SubscriptionsApi(process.env.WS as WebSocketProtocol, process.env.API_URL!);

  export function subscribeToAccounts(onMessage: OnSocketMessage<AccountsSubscription>): OnSocketClose {
    return subscriptionsApi.subscribeToAccounts(
      Storage.readTokenSet()!.accessToken!,
      onMessage,
      displayConnectionError
    );
  }

  export function subscribeToOnlineStatuses(onMessage: OnSocketMessage<OnlineStatusesSubscription>): OnSocketClose {
    return subscriptionsApi.subscribeToOnlineStatuses(
      Storage.readTokenSet()!.accessToken!,
      onMessage,
      displayConnectionError
    );
  }

  export function subscribeToTypingStatuses(onMessage: OnSocketMessage<TypingStatusesSubscription>): OnSocketClose {
    return subscriptionsApi.subscribeToTypingStatuses(
      Storage.readTokenSet()!.accessToken!,
      onMessage,
      displayConnectionError
    );
  }

  export function subscribeToMessages(onMessage: OnSocketMessage<MessagesSubscription>): OnSocketClose {
    return subscriptionsApi.subscribeToMessages(
      Storage.readTokenSet()!.accessToken!,
      onMessage,
      displayConnectionError
    );
  }

  export function subscribeToGroupChats(onMessage: OnSocketMessage<GroupChatsSubscription>): OnSocketClose {
    return subscriptionsApi.subscribeToGroupChats(
      Storage.readTokenSet()!.accessToken!,
      onMessage,
      displayConnectionError
    );
  }
}
