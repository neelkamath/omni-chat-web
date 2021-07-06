import React, { ReactElement, useEffect, useState } from 'react';
import { Button, Input, Space, Spin, Typography } from 'antd';
import { Storage } from '../../Storage';
import ActionableUserCard, { CardExtra, CardPopconfirmation } from './ActionableUserCard';
import { useDispatch, useSelector } from 'react-redux';
import { SearchedUsersSlice } from '../../store/slices/SearchedUsersSlice';

export interface SearchUsersSectionProps {
  readonly type: SearchedUsersSlice.SearchUsersType;
  readonly popconfirmation?: CardPopconfirmation;
  readonly extraRenderer?: CardExtra;
}

export default function SearchUsersSection({
  type,
  popconfirmation,
  extraRenderer,
}: SearchUsersSectionProps): ReactElement {
  const dispatch = useDispatch();
  const query = useSelector(SearchedUsersSlice.selectQuery);
  if (query === undefined) dispatch(SearchedUsersSlice.fetchInitialState(type));
  const isLoading = useSelector(SearchedUsersSlice.selectIsFetchingInitialState);
  const [section, setSection] = useState(<Spin />);
  useEffect(() => {
    if (!isLoading)
      setSection(
        <>
          <Users popconfirmation={popconfirmation} extraRenderer={extraRenderer} />
          {query !== undefined && <LoadMoreUsersButton type={type} />}
        </>,
      );
  }, [popconfirmation, extraRenderer, query, type, isLoading]);
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
        {section}
      </Space>
    </Space>
  );
}

interface UsersProps {
  readonly popconfirmation?: CardPopconfirmation;
  readonly extraRenderer?: CardExtra;
}

function Users({ popconfirmation, extraRenderer }: UsersProps): ReactElement {
  const users = useSelector(SearchedUsersSlice.selectAll);
  const cards = users
    .filter(({ node }) => node.userId !== Storage.readUserId()!)
    .map(({ node }) => (
      <ActionableUserCard
        extraRenderer={extraRenderer}
        popconfirmation={popconfirmation}
        key={node.userId}
        userId={node.userId}
      />
    ));
  return <Space direction='vertical'>{cards}</Space>;
}

interface LoadMoreUsersButtonProps {
  readonly type: SearchedUsersSlice.SearchUsersType;
}

function LoadMoreUsersButton({ type }: LoadMoreUsersButtonProps): ReactElement {
  const hasNextPage = useSelector(SearchedUsersSlice.selectHasNextPage);
  const dispatch = useDispatch();
  const isLoading = useSelector(SearchedUsersSlice.selectIsFetchingAdditional);
  return (
    <Button
      loading={isLoading}
      disabled={!hasNextPage}
      onClick={() => dispatch(SearchedUsersSlice.fetchAdditional(type))}
    >
      {hasNextPage ? 'Load' : 'No'} more users
    </Button>
  );
}

interface SearchUsersFormProps {
  readonly type: SearchedUsersSlice.SearchUsersType;
}

function SearchUsersForm({ type }: SearchUsersFormProps): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const onSearch = async (query: string) => {
    setLoading(true);
    dispatch(SearchedUsersSlice.fetchReplacement({ query, type }));
    setLoading(false);
  };
  return <Input.Search loading={isLoading} onSearch={onSearch} enterButton />;
}
