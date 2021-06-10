import React, { ReactElement } from 'react';
import { message, Space, Spin, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { RootState, useThunkDispatch } from '../../../../store/store';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import { Storage } from '../../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import ActionableUserCard from '../../ActionableUserCard';

export interface RemoveUsersSectionProps {
  readonly chatId: number;
}

export default function RemoveUsersSection({ chatId }: RemoveUsersSectionProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const participants = useSelector((state: RootState) => ChatsSlice.selectParticipants(state, chatId));
  const userId = Storage.readUserId()!;
  if (participants === undefined) return <Spin />;
  const onConfirm = async (userId: number) => {
    const result = await removeGroupChatUsers(chatId, [userId]);
    if (result?.removeGroupChatUsers === null) message.success('User removed.', 3);
  };
  return (
    <Space direction='vertical'>
      <Typography.Text strong>Remove Users</Typography.Text>
      <Typography.Paragraph>
        Removed users&apos; messages and votes on polls won&apos;t get deleted.
      </Typography.Paragraph>
      {participants
        .filter((participant) => participant.userId !== userId)
        .map((participant) => (
          <ActionableUserCard
            key={participant.userId}
            account={participant}
            popconfirmation={{ title: 'Remove user', onConfirm }}
          />
        ))}
    </Space>
  );
}

interface CannotLeaveChat {
  readonly __typename: 'CannotLeaveChat';
}

interface RemoveGroupChatUsersResult {
  readonly removeGroupChatUsers: CannotLeaveChat | null;
}

async function removeGroupChatUsers(
  chatId: number,
  userIdList: number[],
): Promise<RemoveGroupChatUsersResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation RemoveGroupChatUsers($chatId: Int!, $userIdList: [Int!]!) {
              removeGroupChatUsers(chatId: $chatId, userIdList: $userIdList) {
                __typename
              }
            }
          `,
          variables: { chatId, userIdList },
        },
        Storage.readAccessToken()!,
      ),
  );
}
