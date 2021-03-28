import React, { ReactElement, useState } from 'react';
import { Button, Empty, Input, Space } from 'antd';
import { Storage } from '../../Storage';
import UserCard from './UserCard';
import { useDispatch, useSelector } from 'react-redux';
import { SearchedUsersSlice } from '../../store/slices/SearchedUsersSlice';
import { searchUsers } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../api';

export default function SearchUsersSection(): ReactElement {
  const query = useSelector(SearchedUsersSlice.selectQuery);
  return (
    <Space direction='vertical' style={{ padding: 16 }}>
      Search users by their name, username, or email address.
      <Space direction='vertical'>
        <SearchUsersForm />
        <Users />
        {query !== undefined && <LoadMoreUsersButton />}
      </Space>
    </Space>
  );
}

function SearchUsersForm(): ReactElement {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const onSearch = async (query: string) => {
    setLoading(true);
    const result = await operateGraphQlApi(() => searchUsers(httpApiConfig, query, { first: 10 }));
    if (result !== undefined) dispatch(SearchedUsersSlice.replace({ query, users: result.searchUsers }));
    setLoading(false);
  };
  return <Input.Search loading={isLoading} onSearch={onSearch} enterButton />;
}

function Users(): ReactElement {
  const users = useSelector(SearchedUsersSlice.selectAll);
  const cards = users
    .filter(({ node }) => node.id !== Storage.readUserId()!)
    .map(({ node }) => <UserCard key={node.id} account={node} />);
  return cards.length === 0 ? <Empty /> : <Space direction='vertical'>{cards}</Space>;
}

function LoadMoreUsersButton(): ReactElement {
  const query = useSelector(SearchedUsersSlice.selectQuery)!;
  const users = useSelector(SearchedUsersSlice.selectAll);
  const hasNextPage = useSelector(SearchedUsersSlice.selectHasNextPage);
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    const after = users[users.length - 1]?.cursor;
    const connection = await operateGraphQlApi(() => searchUsers(httpApiConfig, query, { after }));
    if (connection !== undefined) dispatch(SearchedUsersSlice.add(connection.searchUsers));
    setLoading(false);
  };
  return (
    <Button loading={isLoading} disabled={!hasNextPage} onClick={onClick}>
      {hasNextPage ? 'Load' : 'No'} more users
    </Button>
  );
}
