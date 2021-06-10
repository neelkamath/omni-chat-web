import React, { ReactElement, useEffect } from 'react';
import { message, Space, Spin, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { Placeholder, queryOrMutate } from '@neelkamath/omni-chat';
import { RootState, useThunkDispatch } from '../../../../store/store';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import { Storage } from '../../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { SearchedUsersSlice } from '../../../../store/slices/SearchedUsersSlice';
import SearchUsersSection from '../../SearchUsersSection';
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
    if (userIdList.includes(userId)) {
      message.info('That user is already a participant.', 5);
      return;
    }
    const result = await addGroupChatUsers(chatId, [userId]);
    if (result !== undefined) message.success('User added.', 3);
  };
  return (
    <Space direction='vertical'>
      <Typography.Text strong>Add Users</Typography.Text>
      <SearchUsersSection
        extraRenderer={(userId) =>
          userIdList.includes(userId) ? <ParticipantIndicator /> : <NonparticipantIndicator />
        }
        popconfirmation={{ title: 'Add user', onConfirm }}
        type='CONTACTS'
      />
    </Space>
  );
}

function ParticipantIndicator(): ReactElement {
  const style = { color: 'green' };
  return (
    <Space>
      <CheckCircleOutlined style={style} />
      <Typography.Text style={style}>Added</Typography.Text>
    </Space>
  );
}

function NonparticipantIndicator(): ReactElement {
  const style = { color: 'red' };
  return (
    <Space>
      <CloseCircleOutlined style={style} />
      <Typography.Text style={style}>Not added</Typography.Text>
    </Space>
  );
}

interface AddGroupChatUsersResult {
  readonly addGroupChatUsers: Placeholder;
}

async function addGroupChatUsers(chatId: number, userIdList: number[]): Promise<AddGroupChatUsersResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation AddGroupChatUsers($chatId: Int!, $userIdList: [Int!]!) {
              addGroupChatUsers(chatId: $chatId, userIdList: $userIdList)
            }
          `,
          variables: { chatId, userIdList },
        },
        Storage.readAccessToken()!,
      ),
  );
}
