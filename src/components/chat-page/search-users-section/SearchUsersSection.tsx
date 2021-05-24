import React, { ReactElement } from 'react';
import { Space, Typography } from 'antd';
import { Storage } from '../../../Storage';
import UserCard from '../UserCard';
import { useDispatch, useSelector } from 'react-redux';
import { SearchedUsersSlice } from '../../../store/slices/SearchedUsersSlice';
import SearchUsersForm from './SearchUsersForm';
import LoadMoreUsersButton from './LoadMoreUsersButton';

export interface SearchUsersSectionProps {
  readonly type: SearchedUsersSlice.SearchUsersType;
}

export default function SearchUsersSection({ type }: SearchUsersSectionProps): ReactElement {
  const query = useSelector(SearchedUsersSlice.selectQuery);
  const dispatch = useDispatch();
  if (query === undefined) dispatch(SearchedUsersSlice.fetchInitialState(type));
  let text: string;
  switch (type) {
    case 'CONTACTS':
      text = 'contacts';
      break;
    case 'BLOCKED_USERS':
      text = "users you've blocked";
      break;
    case 'USERS':
      text = 'users';
  }
  return (
    <Space direction='vertical' style={{ padding: 16 }}>
      <Typography.Text>Search {text} by their name, username, or email address.</Typography.Text>
      <Space direction='vertical'>
        <SearchUsersForm type={type} />
        <Users />
        {query !== undefined && <LoadMoreUsersButton type={type} />}
      </Space>
    </Space>
  );
}

function Users(): ReactElement {
  const users = useSelector(SearchedUsersSlice.selectAll);
  const cards = users
    .filter(({ node }) => node.userId !== Storage.readUserId()!)
    .map(({ node }) => <UserCard key={node.userId} account={node} />);
  return <Space direction='vertical'>{cards}</Space>;
}
