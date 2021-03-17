import React, { ReactElement } from 'react';
import { Col, Empty, Space, Spin } from 'antd';
import UserCard from './UserCard';
import { useSelector } from 'react-redux';
import { BlockedUsersSlice } from '../../store/slices/BlockedUsersSlice';
import store, { useThunkDispatch } from '../../store/store';

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function BlockedUsersSection(): ReactElement {
  const isLoading = !useSelector(BlockedUsersSlice.selectIsLoaded);
  /*
  We only fetch the state once because if it was automatically updated, the UI would glitch when a user is unblocked
  since the unblocked user gets immediately removed from the UI. It's not an issue that the state doesn't update
  automatically for the following reasons because extreme data freshness isn't an issue for this page:
  - The user may have accidentally unblocked a user, and wants to block them again while on the page.
  - If the user has updated the users they've blocked outside this page (e.g., on another device they're using Omni Chat
  on at the same time), then they'll refresh the page if they really want to see the blocked users list updated
  immediately. This is a rare and harmless case since this page will only be viewed for short periods of time.
   */
  const users = BlockedUsersSlice.selectAll(store.getState());
  useThunkDispatch(BlockedUsersSlice.fetchUsers());
  if (isLoading) return <Spin style={{ padding: 16 }} />;
  const cards = users.map((user) => <UserCard key={user.id} account={user} />);
  const content = cards.length === 0 ? <Empty /> : <Space direction='vertical'>{cards}</Space>;
  return <Col style={{ padding: 16 }}>{content}</Col>;
}
