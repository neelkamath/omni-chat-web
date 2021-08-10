import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AccountsSlice } from '../../store/slices/AccountsSlice';
import { RootState } from '../../store/store';
import { Spin } from 'antd';

export interface PrivateChatNameProps {
  /** The ID of the other user in the private chat. */
  readonly userId: number;
}

export default function PrivateChatName({ userId }: PrivateChatNameProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(AccountsSlice.fetchAccount(userId));
  }, [userId, dispatch]);
  const username = useSelector((state: RootState) => AccountsSlice.select(state, userId))?.username;
  return <>{username ?? <Spin size='small' />}</>;
}
