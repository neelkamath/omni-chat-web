import React, { ReactElement, useState } from 'react';
import { Input } from 'antd';
import { AccountsConnection, searchBlockedUsers, searchContacts, searchUsers } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import { Storage } from '../../../Storage';
import store from '../../../store/store';
import { SearchedUsersSlice } from '../../../store/slices/SearchedUsersSlice';
import { SEARCH_USERS_SECTION_PAGINATION, SearchUsersType } from './SearchUsersSection';

export interface SearchUsersFormProps {
  readonly type: SearchUsersType;
}

export default function SearchUsersForm({ type }: SearchUsersFormProps): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onSearch = async (query: string) => {
    setLoading(true);
    await overwriteSearchedUsers(type, query);
    setLoading(false);
  };
  return <Input.Search loading={isLoading} onSearch={onSearch} enterButton />;
}

async function overwriteSearchedUsers(type: SearchUsersType, query: string): Promise<void> {
  let users: AccountsConnection | undefined;
  switch (type) {
    case 'USERS': {
      const response = await operateGraphQlApi(() =>
        searchUsers(httpApiConfig, query, SEARCH_USERS_SECTION_PAGINATION),
      );
      users = response?.searchUsers;
      break;
    }
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
      break;
    }
  }
  if (users !== undefined) store.dispatch(SearchedUsersSlice.replace({ query, users }));
}
