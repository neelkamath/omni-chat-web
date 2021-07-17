import React, { ReactElement, useEffect, useState } from 'react';
import { Button, Input, Space, Spin, Typography } from 'antd';
import { Storage } from '../../Storage';
import ActionableUserCard, { CardExtra, CardPopconfirmation } from './ActionableUserCard';
import { useDispatch, useSelector } from 'react-redux';
import { SearchedUsersSlice } from '../../store/slices/SearchedUsersSlice';
import { ContactsOutlined, SearchOutlined, StopOutlined } from '@ant-design/icons';

export interface SearchUsersSectionProps {
  readonly type: SearchedUsersSlice.SearchUsersType;
  readonly popconfirmation?: CardPopconfirmation;
  readonly extraRenderer?: CardExtra;
  readonly displayTitle?: boolean;
}

export default function SearchUsersSection({
  type,
  popconfirmation,
  extraRenderer,
  displayTitle = false,
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
  return (
    <Space direction='vertical' style={{ padding: 16 }}>
      {displayTitle && <Title type={type} />}
      <Typography.Text>Search {getText(type)} by their name, username, or email address.</Typography.Text>
      <Space direction='vertical'>
        <SearchUsersForm type={type} />
        {section}
      </Space>
    </Space>
  );
}

interface TitleProps {
  readonly type: SearchedUsersSlice.SearchUsersType;
}

function Title({ type }: TitleProps): ReactElement {
  let icon: ReactElement, title: string;
  switch (type) {
    case 'CONTACTS':
      icon = <ContactsOutlined />;
      title = 'Contacts';
      break;
    case 'BLOCKED_USERS':
      icon = <StopOutlined />;
      title = 'Blocked Users';
      break;
    case 'USERS':
      icon = <SearchOutlined />;
      title = 'Users';
  }
  return (
    <Typography.Title level={2}>
      <Space>
        {icon}
        {title}
      </Space>
    </Typography.Title>
  );
}

function getText(type: SearchedUsersSlice.SearchUsersType): string {
  switch (type) {
    case 'CONTACTS':
      return 'contacts';
    case 'BLOCKED_USERS':
      return "users you've blocked";
    case 'USERS':
      return 'users';
  }
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
