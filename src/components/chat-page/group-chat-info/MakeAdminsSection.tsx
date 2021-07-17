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

export interface MakeAdminsSectionProps {
  readonly chatId: number;
}

export default function MakeAdminsSection({ chatId }: MakeAdminsSectionProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChat(chatId));
  }, [dispatch, chatId]);
  const participants = useSelector((state: RootState) => ChatsSlice.selectParticipants(state, chatId));
  const adminIdList = useSelector((state: RootState) => ChatsSlice.selectAdminIdList(state, chatId));
  const userId = Storage.readUserId()!;
  if (participants === undefined || adminIdList === undefined) return <Spin />;
  const onConfirm = async (selectedUserId: number) => {
    if (adminIdList.includes(selectedUserId)) message.info('That user is already an admin.', 5);
    else await operateMakeGroupChatAdmins(chatId, selectedUserId);
  };
  const cards = participants
    .filter((participant) => participant !== userId)
    .map((participant) => (
      <ActionableUserCard
        extraRenderer={(userId) => (adminIdList.includes(userId) ? <AdminIndicator /> : <NonAdminIndicator />)}
        key={participant}
        userId={participant}
        popconfirmation={{ title: 'Make admin', onConfirm }}
      />
    ));
  return (
    <Space direction='vertical'>
      <Typography.Text strong>Make Admins</Typography.Text>
      {cards.length === 0 ? "You're the only participant." : cards}
    </Space>
  );
}

async function operateMakeGroupChatAdmins(chatId: number, userId: number): Promise<void> {
  const response = await makeGroupChatAdmins(chatId, [userId]);
  if (response?.makeGroupChatAdmins === null) message.success('The user is now an admin.', 3);
  else if (response?.makeGroupChatAdmins.__typename === 'MustBeAdmin')
    message.error('You must be an admin to remove users.', 5);
}

interface MustBeAdmin {
  readonly __typename: 'MustBeAdmin';
}

interface MakeGroupChatAdminsResult {
  readonly makeGroupChatAdmins: MustBeAdmin | null;
}

async function makeGroupChatAdmins(
  chatId: number,
  userIdList: number[],
): Promise<MakeGroupChatAdminsResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation MakeGroupChatAdmins($chatId: Int!, $userIdList: [Int!]!) {
              makeGroupChatAdmins(chatId: $chatId, userIdList: $userIdList) {
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
