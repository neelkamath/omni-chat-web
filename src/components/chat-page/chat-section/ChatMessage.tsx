import React, { ReactElement } from 'react';
import { Button, Comment, Spin, Tooltip } from 'antd';
import { RootState, useThunkDispatch } from '../../../store/store';
import { PicsSlice } from '../../../store/slices/PicsSlice';
import { useSelector } from 'react-redux';
import { DeleteOutlined, UserOutlined } from '@ant-design/icons';
import CustomAvatar from '../CustomAvatar';
import { AccountSlice } from '../../../store/slices/AccountSlice';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { Storage } from '../../../Storage';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';

export interface ChatMessageProps {
  readonly message: ChatsSlice.Message;
}

export default function ChatMessage({ message }: ChatMessageProps): ReactElement {
  useThunkDispatch(AccountSlice.fetchAccount());
  const userId = useSelector(AccountSlice.select)?.userId;
  useThunkDispatch(PicsSlice.fetchPic({ id: message.sender.userId, type: 'PROFILE_PIC' }));
  const url = useSelector((state: RootState) =>
    PicsSlice.selectPic(state, 'PROFILE_PIC', message.sender.userId, 'THUMBNAIL'),
  );
  if (userId === undefined) return <Spin size='small' />;
  let actions = undefined;
  if (message.sender.userId === userId)
    actions = [
      <Tooltip key='Delete' title='Delete'>
        <Button danger icon={<DeleteOutlined />} onClick={() => deleteMessage(message.messageId)} />
      </Tooltip>,
    ];
  return (
    <Comment
      actions={actions}
      avatar={<CustomAvatar icon={<UserOutlined />} url={url} />}
      author={message.sender.username}
      content={(message as ChatsSlice.TextMessage).textMessage}
      datetime={message.sent}
    />
  );
}

interface Placeholder {
  readonly __typename: 'Placeholder';
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
