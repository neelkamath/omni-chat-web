import React, { ReactElement } from 'react';
import { Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { Storage } from '../../../../Storage';

export interface DeleteImageButtonProps {
  readonly chatId: number;
}

export default function DeleteImageButton({ chatId }: DeleteImageButtonProps): ReactElement {
  return (
    <Button danger icon={<DeleteOutlined />} onClick={() => operateDeleteGroupChatImage(chatId)}>
      Delete Group Chat Image
    </Button>
  );
}

async function operateDeleteGroupChatImage(chatId: number): Promise<void> {
  const response = await deleteGroupChatImage(chatId);
  if (response?.deleteGroupChatImage === null) message.success('Group chat image deleted.', 3);
  else if (response?.deleteGroupChatImage.__typename === 'MustBeAdmin')
    message.error('You must be an admin to delete the image.', 5);
}

interface DeleteGroupChatImage {
  readonly deleteGroupChatImage: MustBeAdmin | null;
}

interface MustBeAdmin {
  readonly __typename: 'MustBeAdmin';
}

async function deleteGroupChatImage(chatId: number): Promise<DeleteGroupChatImage | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation DeleteGroupChatImage($chatId: Int!) {
              deleteGroupChatImage(chatId: $chatId) {
                __typename
              }
            }
          `,
          variables: { chatId },
        },
        Storage.readAccessToken()!,
      ),
  );
}
