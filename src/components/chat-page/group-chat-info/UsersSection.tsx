import React, { ReactElement } from 'react';
import { Space, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../../store/store';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import ActionableUserCard from '../ActionableUserCard';
import AdminIndicator from './AdminIndicator';
import NonAdminIndicator from './NonAdminIndicator';

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
      extraRenderer={(userId) => (adminIdList.includes(userId) ? <AdminIndicator /> : <NonAdminIndicator />)}
      key={participant.userId}
      account={participant}
    />
  ));
  return <Space direction='vertical'>{cards}</Space>;
}
