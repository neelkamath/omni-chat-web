import { GraphQlResponse, GroupChatDescription, GroupChatTitle, subscribe } from '@neelkamath/omni-chat';
import { displayBugReporter, wsApiConfig } from '../../api';
import store from '../../store/store';
import { ChatsSlice } from '../../store/slices/ChatsSlice';
import { Storage } from '../../Storage';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';
import { message } from 'antd';
import { PicsSlice } from '../../store/slices/PicsSlice';
import { onSubscriptionError, PromiseResolver, subscriptionClosers, verifySubscriptionCreation } from '../manager';

interface SubscribeToChatsResult {
  readonly subscribeToChats:
    | CreatedSubscription
    | GroupChatId
    | UpdatedGroupChatPic
    | UpdatedGroupChat
    | DeletedPrivateChat;
}

interface CreatedSubscription {
  readonly __typename: 'CreatedSubscription';
}

interface DeletedPrivateChat {
  readonly __typename: 'DeletedPrivateChat';
  readonly chatId: number;
}

interface GroupChatId {
  readonly __typename: 'GroupChatId';
  readonly chatId: number;
}

interface UpdatedGroupChatPic {
  readonly __typename: 'UpdatedGroupChatPic';
  readonly chatId: number;
}

interface UpdatedGroupChat {
  readonly __typename: 'UpdatedGroupChat';
  readonly chatId: number;
  readonly title: GroupChatTitle | null;
  readonly description: GroupChatDescription | null;
  readonly newUsers: UpdatedGroupChatAccount[] | null;
  readonly removedUsers: UpdatedGroupChatAccount[] | null;
  readonly adminIdList: number[] | null;
  readonly isBroadcast: boolean | null;
  readonly publicity: GroupChatPublicity | null;
}

interface UpdatedGroupChatAccount {
  readonly userId: number;
}

export type GroupChatPublicity = 'INVITABLE' | 'NOT_INVITABLE' | 'PUBLIC';

const query = `
  subscription SubscribeToChats {
    subscribeToChats {
      __typename
      ... on GroupChatId {
        chatId
      }
      ... on UpdatedGroupChat {
        chatId
        title
        description
        newUsers {
          userId
        }
        removedUsers {
          userId
        }
        adminIdList
        isBroadcast
        publicity
      }
      ... on UpdatedGroupChatPic {
        chatId
      }
      ... on DeletedPrivateChat {
        chatId
      }
    }
  }
`;

async function onMessage(
  resolve: PromiseResolver,
  { data, errors }: GraphQlResponse<SubscribeToChatsResult>,
): Promise<void> {
  if (errors !== undefined) await displayBugReporter(errors);
  const event = data?.subscribeToChats;
  switch (event?.__typename) {
    case 'CreatedSubscription':
      resolve();
      break;
    case 'GroupChatId':
      store.dispatch(ChatsSlice.fetchChat(event.chatId));
      break;
    case 'UpdatedGroupChat':
      store.dispatch(ChatsSlice.updateGroupChat(event));
      if (event.removedUsers?.find(({ userId }) => Storage.readUserId() === userId) !== undefined) {
        store.dispatch(ChatsSlice.removeOne(event.chatId));
        if (ChatPageLayoutSlice.select(store.getState()).chatId === event.chatId) {
          message.info("You're no longer in this chat.", 5);
          store.dispatch(ChatPageLayoutSlice.update({ type: 'EMPTY' }));
        }
      }
      break;
    case 'UpdatedGroupChatPic':
      store.dispatch(PicsSlice.fetch({ id: event.chatId, type: 'GROUP_CHAT_PIC', shouldUpdateOnly: true }));
      break;
    case 'DeletedPrivateChat':
      ChatsSlice.removeOne(event.chatId);
      if (ChatPageLayoutSlice.select(store.getState()).chatId === event.chatId) {
        message.info('The other user just deleted their account.', 5);
        store.dispatch(ChatPageLayoutSlice.update({ type: 'EMPTY' }));
      }
  }
}

/** Keeps the {@link store} up-to-date with events from the GraphQL subscription `subscribeToChats`. */
export async function subscribeToChats(): Promise<void> {
  verifySubscriptionCreation(subscriptionClosers.onGroupChatsSubscriptionClose);
  return new Promise((resolve) => {
    subscriptionClosers.onGroupChatsSubscriptionClose = subscribe(
      wsApiConfig,
      Storage.readAccessToken()!,
      '/chats-subscription',
      query,
      (response: GraphQlResponse<SubscribeToChatsResult>) => onMessage(resolve, response),
      onSubscriptionError,
    );
  });
}
