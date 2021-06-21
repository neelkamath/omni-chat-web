import { message } from 'antd';
import { httpApiConfig, operateGraphQlApi } from './api';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { Storage } from './Storage';

export default async function operateCreatePrivateChat(userId: number): Promise<number | undefined> {
  const response = await createPrivateChat(userId);
  if (response?.createPrivateChat.__typename === 'InvalidUserId') {
    message.warning('The user just deleted their account.', 5);
    return undefined;
  }
  return response?.createPrivateChat.chatId;
}

interface InvalidUserId {
  readonly __typename: 'InvalidUserId';
}

interface CreatedChatId {
  readonly __typename: 'CreatedChatId';
  readonly chatId: number;
}

interface CreatePrivateChatResult {
  readonly createPrivateChat: InvalidUserId | CreatedChatId;
}

async function createPrivateChat(userId: number): Promise<CreatePrivateChatResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation CreatePrivateChat($userId: Int!) {
              createPrivateChat(userId: $userId) {
                __typename
                ... on CreatedChatId {
                  chatId
                }
              }
            }
          `,
          variables: { userId },
        },
        Storage.readAccessToken()!,
      ),
  );
}
