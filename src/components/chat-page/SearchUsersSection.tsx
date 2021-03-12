import React, {ReactElement, useState} from 'react';
import {Button, Empty, Form, Input, Space} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import {Storage} from '../../Storage';
import UserCard from './UserCard';
import {useDispatch, useSelector} from 'react-redux';
import {SearchedUsersSlice} from '../../store/slices/SearchedUsersSlice';
import {QueriesApiWrapper} from '../../api/QueriesApiWrapper';

/** Number of users to query for at a time. */
const QUERY_COUNT = 10;

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function SearchUsersSection(): ReactElement {
  const hasNextPage = useSelector(SearchedUsersSlice.selectHasNextPage);
  return (
    <Space direction="vertical" style={{padding: 16}}>
      Search users by their name, username, or email address.
      <Space direction="vertical">
        <SearchUsersForm />
        <Users />
        {hasNextPage && <LoadMoreUsersButton />}
      </Space>
    </Space>
  );
}

interface SearchUsersFormData {
  readonly query: string;
}

function SearchUsersForm(): ReactElement {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const onFinish = async ({query}: SearchUsersFormData) => {
    setLoading(true);
    const users = await QueriesApiWrapper.searchUsers(query, {
      first: QUERY_COUNT,
    });
    if (users !== undefined) dispatch(SearchedUsersSlice.replace({query, users}));
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name="searchUsers" layout="inline">
      <Form.Item name="query" initialValue="">
        <Input />
      </Form.Item>
      <Form.Item>
        <Button loading={isLoading} type="primary" htmlType="submit" icon={<SearchOutlined />} />
      </Form.Item>
    </Form>
  );
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function Users(): ReactElement {
  const users = useSelector(SearchedUsersSlice.selectAll);
  const cards = users
    .filter(({node}) => node.id !== Storage.readUserId()!)
    .map(({node}) => <UserCard key={node.id} account={node} />);
  return cards.length === 0 ? <Empty /> : <Space direction="vertical">{cards}</Space>;
}

function LoadMoreUsersButton(): ReactElement {
  const query = useSelector(SearchedUsersSlice.selectQuery)!;
  const users = useSelector(SearchedUsersSlice.selectAll);
  const hasNextPage = useSelector(SearchedUsersSlice.selectHasNextPage);
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    const after = users[users.length - 1]!.cursor;
    const connection = await QueriesApiWrapper.searchUsers(query, {
      first: QUERY_COUNT,
      after,
    });
    if (connection !== undefined) dispatch(SearchedUsersSlice.add(connection));
    setLoading(false);
  };
  return (
    <Button loading={isLoading} disabled={!hasNextPage} onClick={onClick}>
      {hasNextPage ? 'Load' : 'No'} more users
    </Button>
  );
}
