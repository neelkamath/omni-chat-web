import React, { ReactElement, useState } from 'react';
import { Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Placeholder, queryOrMutate } from '@neelkamath/omni-chat';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { Storage } from '../../../../Storage';

export interface DeleteActionProps {
  readonly message: ChatsSlice.Message;
}

export default function DeleteAction({ message }: DeleteActionProps): ReactElement {
  const [isVisible, setVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const onConfirm = async () => {
    setLoading(true);
    await deleteMessage(message.messageId);
  };
  return (
    <Popconfirm
      visible={isVisible}
      title='Delete?'
      onCancel={() => setVisible(false)}
      okButtonProps={{ loading: isLoading }}
      onConfirm={onConfirm}
      onVisibleChange={() => setVisible(!isVisible)}
    >
      <Button danger icon={<DeleteOutlined />} onClick={() => setVisible(true)} />
    </Popconfirm>
  );
}

interface DeleteMessageResult {
  readonly deleteMessage: Placeholder | null;
}

async function deleteMessage(messageId: number): Promise<DeleteMessageResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation DeleteMessage($id: Int!) {
              deleteMessage(id: $id) {
                __typename
              }
            }
          `,
          variables: { id: messageId },
        },
        Storage.readAccessToken()!,
      ),
  );
}
