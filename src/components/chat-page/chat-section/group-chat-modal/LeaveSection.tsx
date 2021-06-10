import React, { ReactElement, useState } from 'react';
import { Button, message, Space, Tooltip } from 'antd';
import { queryOrMutate } from '@neelkamath/omni-chat';
import store, { useThunkDispatch } from '../../../../store/store';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import { Storage } from '../../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ChatPageLayoutSlice } from '../../../../store/slices/ChatPageLayoutSlice';

export interface LeaveSectionProps {
  readonly chatId: number;
}

export default function LeaveSection({ chatId }: LeaveSectionProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const [isLoading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    const result = await leaveGroupChat(chatId);
    setLoading(false);
    if (result?.leaveGroupChat === null) {
      message.success('You left the chat.', 3);
      store.dispatch(ChatPageLayoutSlice.update({ type: 'EMPTY' }));
    } else if (result?.leaveGroupChat.__typename === 'CannotLeaveChat')
      message.error('You must first appoint another participant as an admin.', 5);
  };
  return (
    <Button danger onClick={onClick} loading={isLoading}>
      <Tooltip
        title={
          "You can't leave if the chat has other participants, and you're the last admin. In such a case, you'll " +
          'have to first appoint another participant as an admin.'
        }
        placement='right'
      >
        <Space>
          Leave <QuestionCircleOutlined />
        </Space>
      </Tooltip>
    </Button>
  );
}

interface InvalidChatId {
  readonly __typename: 'InvalidChatId';
}

interface CannotLeaveChat {
  readonly __typename: 'CannotLeaveChat';
}

interface LeaveGroupChatResult {
  readonly leaveGroupChat: InvalidChatId | CannotLeaveChat | null;
}

async function leaveGroupChat(chatId: number): Promise<LeaveGroupChatResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation LeaveGroupChat($chatId: Int!) {
              leaveGroupChat(chatId: $chatId) {
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
