import React, { ReactElement } from 'react';
import { Space, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../../../store/store';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import { AuditOutlined, UserOutlined } from '@ant-design/icons';
import ActionableUserCard from '../../ActionableUserCard';
import { blue } from '@ant-design/colors';

export interface UsersSectionProps {
  readonly chatId: number;
}

export default function UsersSection({ chatId }: UsersSectionProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const participants = useSelector((state: RootState) => ChatsSlice.selectParticipants(state, chatId));
  const adminIdList = useSelector((state: RootState) => ChatsSlice.selectAdminIdList(state, chatId));
  if (participants === undefined || adminIdList === undefined) return <Spin />;
  const cards = participants.map((participant) => (
    <ActionableUserCard
      extraRenderer={(userId) => (adminIdList.includes(userId) ? <AdminIndicator /> : <NonadminIndicator />)}
      key={participant.userId}
      account={participant}
    />
  ));
  return <Space direction='vertical'>{cards}</Space>;
}

function AdminIndicator(): ReactElement {
  return (
    <Space style={{ color: blue.primary }}>
      <AuditOutlined /> Admin
    </Space>
  );
}

function NonadminIndicator(): ReactElement {
  return (
    <Space>
      <UserOutlined /> Non-admin
    </Space>
  );
}
