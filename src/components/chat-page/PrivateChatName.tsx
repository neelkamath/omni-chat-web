import { ChatsSlice } from '../../store/slices/ChatsSlice';
import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AccountsSlice } from '../../store/slices/AccountsSlice';
import { RootState } from '../../store/store';
import { Spin } from 'antd';

export interface PrivateChatNameProps {
  readonly chat: ChatsSlice.PrivateChat;
}

export default function PrivateChatName({ chat }: PrivateChatNameProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    if (chat.__typename === 'PrivateChat') dispatch(AccountsSlice.fetch(chat.user.userId));
  }, [chat, dispatch]);
  const username = useSelector((state: RootState) => AccountsSlice.select(state, chat.user.userId))?.username;
  return username === undefined ? <Spin size='small' /> : <>{username}</>;
}
