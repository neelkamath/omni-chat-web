import React, { ReactElement, useEffect } from 'react';
import { message, Space, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { RootState, useThunkDispatch } from '../../../store/store';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { Storage } from '../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import { SearchedUsersSlice } from '../../../store/slices/SearchedUsersSlice';
import SearchUsersSection from '../SearchUsersSection';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

export interface AddUsersSectionProps {
  readonly chatId: number;
}

export default function AddUsersSection({ chatId }: AddUsersSectionProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const userIdList = useSelector((state: RootState) => ChatsSlice.selectParticipantIdList(state, chatId));
  useEffect(() => {
    SearchedUsersSlice.clear();
    SearchedUsersSlice.fetchInitialState('CONTACTS');
  }, []);
  if (userIdList === undefined) return <Spin />;
  const onConfirm = async (userId: number) => {
    if (userIdList.includes(userId)) message.info('That user is already a participant.', 5);
    else await operateAddGroupChatUsers(chatId, userId);
  };
  return (
    <SearchUsersSection
      extraRenderer={(userId) => (userIdList.includes(userId) ? <ParticipantIndicator /> : <NonparticipantIndicator />)}
      popconfirmation={{ title: 'Add user', onConfirm }}
      type='CONTACTS'
    />
  );
}

async function operateAddGroupChatUsers(chatId: number, userId: number): Promise<void> {
  const response = await addGroupChatUsers(chatId, [userId]);
  if (response?.addGroupChatUsers?.__typename === null) message.success('User added.', 3);
  else if (response?.addGroupChatUsers?.__typename === 'MustBeAdmin')
    message.error('You must be an admin to add users.', 5);
}

function ParticipantIndicator(): ReactElement {
  return (
    <Space style={{ color: 'green' }}>
      <CheckCircleOutlined /> Added
    </Space>
  );
}

function NonparticipantIndicator(): ReactElement {
  return (
    <Space style={{ color: 'red' }}>
      <CloseCircleOutlined /> Not added
    </Space>
  );
}

interface AddGroupChatUsersResult {
  readonly addGroupChatUsers: MustBeAdmin | null;
}

interface MustBeAdmin {
  readonly __typename: 'MustBeAdmin';
}

async function addGroupChatUsers(chatId: number, userIdList: number[]): Promise<AddGroupChatUsersResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation AddGroupChatUsers($chatId: Int!, $userIdList: [Int!]!) {
              addGroupChatUsers(chatId: $chatId, userIdList: $userIdList) {
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
