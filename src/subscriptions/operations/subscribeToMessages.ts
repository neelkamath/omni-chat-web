import { DateTime, GraphQlResponse, MessageText, subscribe, Uuid } from '@neelkamath/omni-chat';
import { displayBugReporter, wsApiConfig } from '../../api';
import store from '../../store/store';
import { ChatsSlice } from '../../store/slices/ChatsSlice';
import { PicMessagesSlice } from '../../store/slices/PicMessagesSlice';
import { Storage } from '../../Storage';
import { onSubscriptionError, PromiseResolver, subscriptionClosers, verifySubscriptionCreation } from '../manager';

interface SubscribeToMessagesResult {
  readonly subscribeToMessages:
    | CreatedSubscription
    | DeletedMessage
    | UpdatedPollMessage
    | UserChatMessagesRemoval
    | NewActionMessage
    | NewAudioMessage
    | NewDocMessage
    | NewGroupChatInviteMessage
    | NewPicMessage
    | NewPollMessage
    | NewTextMessage
    | NewVideoMessage;
}

interface CreatedSubscription {
  readonly __typename: 'CreatedSubscription';
}

interface NewMessage {
  readonly __typename:
    | 'NewActionMessage'
    | 'NewAudioMessage'
    | 'NewDocMessage'
    | 'NewGroupChatInviteMessage'
    | 'NewPicMessage'
    | 'NewPollMessage'
    | 'NewTextMessage'
    | 'NewVideoMessage';
  readonly chatId: number;
  readonly messageId: number;
  readonly isForwarded: boolean;
  readonly sent: DateTime;
  readonly sender: Sender;
}

interface Sender {
  readonly userId: number;
}

interface NewTextMessage extends NewMessage {
  readonly __typename: 'NewTextMessage';
  readonly textMessage: MessageText;
}

interface NewActionMessage extends NewMessage {
  readonly __typename: 'NewActionMessage';
  readonly actionableMessage: ActionableMessage;
}

interface ActionableMessage {
  readonly text: MessageText;
  readonly actions: MessageText[];
}

interface NewPicMessage extends NewMessage {
  readonly __typename: 'NewPicMessage';
  readonly caption: MessageText;
}

interface NewAudioMessage extends NewMessage {
  readonly __typename: 'NewAudioMessage';
}

interface NewGroupChatInviteMessage extends NewMessage {
  readonly __typename: 'NewGroupChatInviteMessage';
  readonly inviteCode: Uuid | null;
}

interface NewDocMessage extends NewMessage {
  readonly __typename: 'NewDocMessage';
}

interface NewVideoMessage extends NewMessage {
  readonly __typename: 'NewVideoMessage';
}

interface NewPollMessage extends NewMessage {
  readonly __typename: 'NewPollMessage';
  readonly poll: Poll;
}

interface Poll {
  readonly question: MessageText;
  readonly options: PollOption[];
}

interface PollOption {
  readonly option: MessageText;
  readonly votes: VoterAccount[];
}

interface VoterAccount {
  readonly userId: number;
}

interface DeletedMessage {
  readonly __typename: 'DeletedMessage';
  readonly chatId: number;
  readonly messageId: number;
}

interface UserChatMessagesRemoval {
  readonly __typename: 'UserChatMessagesRemoval';
  readonly chatId: number;
  readonly userId: number;
}

interface UpdatedPollMessage {
  readonly __typename: 'UpdatedPollMessage';
  readonly chatId: number;
  readonly messageId: number;
  readonly poll: Poll;
}

const query = `
  subscription SubscribeToMessages {
    subscribeToMessages {
      __typename
      ... on UpdatedPollMessage {
        chatId
        messageId
        poll {
          question
          options {
            option
            votes {
              userId
            }
          }
        }
      }
      ... on DeletedMessage {
        chatId
        messageId
      }
      ... on NewMessage {
        chatId
        messageId
        isForwarded
        sent
        sender {
          userId
        }
      }
      ... on NewTextMessage {
        textMessage
      }
      ... on NewActionMessage {
        actionableMessage {
          text
          actions
        }
      }
      ... on NewPicMessage {
        caption
      }
      ... on NewPollMessage {
        poll {
          question
          options {
            option
            votes {
              userId
            }
          }
        }
      }
      ... on NewGroupChatInviteMessage {
        inviteCode
      }
      ... on UserChatMessagesRemoval {
        chatId
        userId
      }
    }
  }
`;

async function onMessage(
  resolve: PromiseResolver,
  { data, errors }: GraphQlResponse<SubscribeToMessagesResult>,
): Promise<void> {
  if (errors !== undefined) await displayBugReporter(errors);
  const event = data?.subscribeToMessages;
  switch (event?.__typename) {
    case 'CreatedSubscription':
      resolve();
      break;
    case 'UpdatedPollMessage':
      store.dispatch(ChatsSlice.updatePoll(event));
      break;
    case 'DeletedMessage':
      store.dispatch(ChatsSlice.deleteMessage(event));
      store.dispatch(PicMessagesSlice.deleteMessage(event.messageId));
      break;
    case 'UserChatMessagesRemoval':
      /*
      FIXME: Messages get deleted but infinite spinners take their place. This might get fixed in Omni Chat Backend
       0.22.0 because I think it's due to the user not actually getting deleted.
       */
      store.dispatch(ChatsSlice.removeUserChatMessages(event));
      break;
    case 'NewActionMessage':
    case 'NewAudioMessage':
    case 'NewDocMessage':
    case 'NewGroupChatInviteMessage':
    case 'NewPicMessage':
    case 'NewPollMessage':
    case 'NewTextMessage':
    case 'NewVideoMessage':
      store.dispatch(ChatsSlice.fetchChat(event.chatId)); // Fetches the chat in case it wasn't in the store.
      store.dispatch(ChatsSlice.addMessage(event)); // Adds the message if the chat is already in the store.
  }
}

/** Keeps the {@link store} up-to-date with events from the GraphQL subscription `subscribeToMessages`. */
export async function subscribeToMessages(): Promise<void> {
  verifySubscriptionCreation(subscriptionClosers.onMessagesSubscriptionClose);
  return new Promise((resolve) => {
    subscriptionClosers.onMessagesSubscriptionClose = subscribe(
      wsApiConfig,
      Storage.readAccessToken()!,
      '/messages-subscription',
      query,
      (response: GraphQlResponse<SubscribeToMessagesResult>) => onMessage(resolve, response),
      onSubscriptionError,
    );
  });
}
