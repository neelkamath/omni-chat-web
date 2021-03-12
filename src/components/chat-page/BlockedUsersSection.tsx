import React, {ReactElement} from 'react';
import {Col, Empty, Space, Spin} from 'antd';
import UserCard from './UserCard';
import {useDispatch, useSelector} from 'react-redux';
import {BlockedUsersSlice} from '../../store/slices/BlockedUsersSlice';

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function BlockedUsersSection(): ReactElement {
  const isLoaded = useSelector(BlockedUsersSlice.selectIsLoaded);
  const users = useSelector(BlockedUsersSlice.selectAll);
  const dispatch = useDispatch();
  dispatch(BlockedUsersSlice.fetchUsers());
  if (!isLoaded) return <Spin style={{padding: 16}} />;
  const cards = users.map(user => <UserCard key={user.id} account={user} />);
  const content = cards.length === 0 ? <Empty /> : <Space direction="vertical">{cards}</Space>;
  return <Col style={{padding: 16}}>{content}</Col>;
}
