import React, { ReactElement } from 'react';
import { Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Placeholder, queryOrMutate } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { Storage } from '../../../../Storage';

export interface DeletePicButtonProps {
  readonly chatId: number;
}

export default function DeletePicButton({ chatId }: DeletePicButtonProps): ReactElement {
  const onClick = async () => {
    const response = await deleteGroupChatPic(chatId);
    if (response !== undefined) message.success('Group chat picture deleted.', 3);
  };
  return (
    <Button danger icon={<DeleteOutlined />} onClick={onClick}>
      Delete Group Chat Picture
    </Button>
  );
}

interface DeleteGroupChatPic {
  readonly deleteGroupChatPic: Placeholder;
}

async function deleteGroupChatPic(chatId: number): Promise<DeleteGroupChatPic | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation DeleteGroupChatPic($chatId: Int!) {
              deleteGroupChatPic(chatId: $chatId)
            }
          `,
          variables: { chatId },
        },
        Storage.readAccessToken()!,
      ),
  );
}
