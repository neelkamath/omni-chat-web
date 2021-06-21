import React, { ReactElement, useEffect } from 'react';
import { Space, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import ActionableUserCard from '../ActionableUserCard';
import AdminIndicator from './AdminIndicator';
import NonAdminIndicator from './NonAdminIndicator';

export interface UsersSectionProps {
  readonly chatId: number;
}

export default function UsersSection({ chatId }: UsersSectionProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChat(chatId));
  }, [dispatch, chatId]);
  const participants = useSelector((state: RootState) => ChatsSlice.selectParticipants(state, chatId));
  const adminIdList = useSelector((state: RootState) => ChatsSlice.selectAdminIdList(state, chatId));
  if (participants === undefined || adminIdList === undefined) return <Spin />;
  const cards = participants.map((participant) => (
    <ActionableUserCard
      extraRenderer={(userId) => (adminIdList.includes(userId) ? <AdminIndicator /> : <NonAdminIndicator />)}
      key={participant}
      userId={participant}
    />
  ));
  return <Space direction='vertical'>{cards}</Space>;
}
