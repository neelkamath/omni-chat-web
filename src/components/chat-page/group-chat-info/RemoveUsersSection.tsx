import React, { ReactElement, useEffect } from 'react';
import { message, Space, Spin, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { RootState } from '../../../store/store';
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
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChat(chatId));
  }, [dispatch, chatId]);
  const participants = useSelector((state: RootState) => ChatsSlice.selectParticipants(state, chatId));
  const adminIdList = useSelector((state: RootState) => ChatsSlice.selectAdminIdList(state, chatId));
  const userId = Storage.readUserId()!;
  if (participants === undefined || adminIdList === undefined) return <Spin />;
  const onConfirm = async (userId: number) => {
    message.info('Removing the user...', 3);
    await operateRemoveGroupChatUsers(chatId, userId);
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

async function operateRemoveGroupChatUsers(chatId: number, userId: number): Promise<void> {
  const response = await removeGroupChatUsers(chatId, [userId]);
  if (response?.removeGroupChatUsers === null) message.success('User removed.', 3);
  else if (response?.removeGroupChatUsers.__typename === 'MustBeAdmin')
    message.error('You must be an admin to remove users.', 5);
}

interface CannotLeaveChat {
  readonly __typename: 'CannotLeaveChat';
}

interface MustBeAdmin {
  readonly __typename: 'MustBeAdmin';
}

interface RemoveGroupChatUsersResult {
  readonly removeGroupChatUsers: CannotLeaveChat | MustBeAdmin | null;
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
