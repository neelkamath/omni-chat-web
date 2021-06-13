import React, { ReactElement } from 'react';
import { message, Space, Spin, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { RootState, useThunkDispatch } from '../../../store/store';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { Storage } from '../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import ActionableUserCard from '../ActionableUserCard';
import AdminIndicator from './AdminIndicator';
import NonAdminIndicator from './NonAdminIndicator';

export interface RemoveUsersSectionProps {
  readonly chatId: number;
}

export default function RemoveUsersSection({ chatId }: RemoveUsersSectionProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const participants = useSelector((state: RootState) => ChatsSlice.selectParticipants(state, chatId));
  const adminIdList = useSelector((state: RootState) => ChatsSlice.selectAdminIdList(state, chatId));
  const userId = Storage.readUserId()!;
  if (participants === undefined || adminIdList === undefined) return <Spin />;
  const onConfirm = async (userId: number) => {
    message.info('Removing the user...', 3);
    const response = await removeGroupChatUsers(chatId, [userId]);
    if (response?.removeGroupChatUsers === null) message.success('User removed.', 3);
  };
  const cards = participants
    .filter((participant) => participant.userId !== userId)
    .map((participant) => (
      <ActionableUserCard
        extraRenderer={(userId) => (adminIdList.includes(userId) ? <AdminIndicator /> : <NonAdminIndicator />)}
        key={participant.userId}
        account={participant}
        popconfirmation={{ title: 'Remove user', onConfirm }}
      />
    ));
  return (
    <>
      <Typography.Text strong>Remove Users</Typography.Text>
      <Typography.Paragraph>
        Removed users&apos; messages and votes on polls won&apos;t get deleted.
      </Typography.Paragraph>
      <Space direction='vertical'>{cards.length === 0 ? "You're the only participant." : cards}</Space>
    </>
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
