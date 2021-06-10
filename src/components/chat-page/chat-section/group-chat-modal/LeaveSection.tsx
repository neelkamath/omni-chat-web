import React, { ReactElement, useState } from 'react';
import { Button, message, Popconfirm, Space, Typography } from 'antd';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { Storage } from '../../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { ChatPageLayoutSlice } from '../../../../store/slices/ChatPageLayoutSlice';
import { useDispatch } from 'react-redux';

export interface LeaveSectionProps {
  readonly chatId: number;
}

export default function LeaveSection({ chatId }: LeaveSectionProps): ReactElement {
  return (
    <Space direction='vertical'>
      <Typography.Text strong>Leave Chat</Typography.Text>
      <Typography.Paragraph>
        Your messages and votes on polls will remain if you leave the chat. Messages you&apos;ve starred in the chat
        will get unstarred for you.
      </Typography.Paragraph>
      <Typography.Paragraph>
        You can&apos;t leave if the chat has other participants, and you&apos;re the last admin. In such a case,
        you&apos;ll have to first appoint another participant as an admin.
      </Typography.Paragraph>
      <LeaveButton chatId={chatId} />
    </Space>
  );
}

interface LeaveButtonProps {
  readonly chatId: number;
}

function LeaveButton({ chatId }: LeaveButtonProps): ReactElement {
  const dispatch = useDispatch();
  const [isVisible, setVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const onConfirm = async () => {
    setLoading(true);
    const result = await leaveGroupChat(chatId);
    setLoading(false);
    setVisible(false);
    if (result?.leaveGroupChat === null) {
      message.success('You left the chat.', 3);
      dispatch(ChatPageLayoutSlice.update({ type: 'EMPTY' }));
    } else if (result?.leaveGroupChat.__typename === 'CannotLeaveChat')
      message.error('You must first appoint another participant as an admin.', 5);
  };
  return (
    <Popconfirm
      title='Leave'
      visible={isVisible}
      onConfirm={onConfirm}
      okButtonProps={{ loading: isLoading }}
      onCancel={() => setVisible(false)}
    >
      <Button onClick={() => setVisible(true)} danger>
        Leave the chat
      </Button>
    </Popconfirm>
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
