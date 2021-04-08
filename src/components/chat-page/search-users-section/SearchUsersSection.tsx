import React, { ReactElement } from 'react';
import { Space, Typography } from 'antd';
import { Storage } from '../../../Storage';
import UserCard from '../UserCard';
import { useSelector } from 'react-redux';
import { SearchedUsersSlice } from '../../../store/slices/SearchedUsersSlice';
import SearchUsersForm from './SearchUsersForm';
import LoadMoreUsersButton from './LoadMoreUsersButton';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import { AccountsConnection, ForwardPagination, searchBlockedUsers, searchContacts } from '@neelkamath/omni-chat';
import store from '../../../store/store';

export const SEARCH_USERS_SECTION_PAGINATION: ForwardPagination = { first: 10 };

/**
 * - `'USERS'` indicates every user registered on the Omni Chat instance.
 * - `'CONTACTS'` indicates the user's saved contacts.
 * - `'BLOCKED_USERS'` indicates the users blocked by the user.
 */
export type SearchUsersType = 'USERS' | 'CONTACTS' | 'BLOCKED_USERS';

export interface SearchUsersSectionProps {
  readonly type: SearchUsersType;
}

export default function SearchUsersSection({ type }: SearchUsersSectionProps): ReactElement {
  const query = useSelector(SearchedUsersSlice.selectQuery);
  if (query === undefined) fetchInitialState(type);
  let text: string;
  switch (type) {
    case 'CONTACTS':
      text = 'contacts';
      break;
    case 'BLOCKED_USERS':
      text = 'users you\'ve blocked';
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

async function fetchInitialState(type: SearchUsersType): Promise<void> {
  const query = '';
  let users: AccountsConnection | undefined;
  switch (type) {
    case 'BLOCKED_USERS': {
      const response = await operateGraphQlApi(() =>
        searchBlockedUsers(httpApiConfig, Storage.readAccessToken()!, query, SEARCH_USERS_SECTION_PAGINATION),
      );
      users = response?.searchBlockedUsers;
      break;
    }
    case 'CONTACTS': {
      const response = await operateGraphQlApi(() =>
        searchContacts(httpApiConfig, Storage.readAccessToken()!, query, SEARCH_USERS_SECTION_PAGINATION),
      );
      users = response?.searchContacts;
    }
  }
  if (users !== undefined) store.dispatch(SearchedUsersSlice.replace({ query, users }));
}

function Users(): ReactElement {
  const users = useSelector(SearchedUsersSlice.selectAll);
  const cards = users
    .filter(({ node }) => node.id !== Storage.readUserId()!)
    .map(({ node }) => <UserCard key={node.id} account={node} />);
  return <Space direction='vertical'>{cards}</Space>;
}
