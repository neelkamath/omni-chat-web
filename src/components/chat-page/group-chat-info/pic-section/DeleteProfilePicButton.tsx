import React, { ReactElement } from 'react';
import { Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { Storage } from '../../../../Storage';

export interface DeletePicButtonProps {
  readonly chatId: number;
}

export default function DeletePicButton({ chatId }: DeletePicButtonProps): ReactElement {
  return (
    <Button danger icon={<DeleteOutlined />} onClick={() => operateDeleteGroupChatPic(chatId)}>
      Delete Group Chat Picture
    </Button>
  );
}

async function operateDeleteGroupChatPic(chatId: number): Promise<void> {
  const response = await deleteGroupChatPic(chatId);
  if (response?.deleteGroupChatPic === null) message.success('Group chat picture deleted.', 3);
  else if (response?.deleteGroupChatPic.__typename === 'MustBeAdmin')
    message.error('You must be an admin to delete the pic.', 5);
}

interface DeleteGroupChatPic {
  readonly deleteGroupChatPic: MustBeAdmin | null;
}

interface MustBeAdmin {
  readonly __typename: 'MustBeAdmin';
}

async function deleteGroupChatPic(chatId: number): Promise<DeleteGroupChatPic | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation DeleteGroupChatPic($chatId: Int!) {
              deleteGroupChatPic(chatId: $chatId) {
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
