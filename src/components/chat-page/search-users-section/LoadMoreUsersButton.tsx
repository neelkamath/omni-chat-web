import React, { ReactElement, useState } from 'react';
import { useSelector } from 'react-redux';
import { SearchedUsersSlice } from '../../../store/slices/SearchedUsersSlice';
import { Button } from 'antd';
import store from '../../../store/store';
import { AccountsConnection, searchBlockedUsers, searchContacts, searchUsers } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import { Storage } from '../../../Storage';
import { SearchUsersType } from './SearchUsersSection';

export interface LoadMoreUsersButtonProps {
  readonly type: SearchUsersType;
}

export default function LoadMoreUsersButton({ type }: LoadMoreUsersButtonProps): ReactElement {
  const hasNextPage = useSelector(SearchedUsersSlice.selectHasNextPage);
  const [isLoading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    await addSearchedUsers(type);
    setLoading(false);
  };
  return (
    <Button loading={isLoading} disabled={!hasNextPage} onClick={onClick}>
      {hasNextPage ? 'Load' : 'No'} more users
    </Button>
  );
}

async function addSearchedUsers(type: SearchUsersType): Promise<void> {
  const query = SearchedUsersSlice.selectQuery(store.getState())!;
  const users = SearchedUsersSlice.selectAll(store.getState());
  const after = users[users.length - 1]?.cursor;
  let connection: AccountsConnection | undefined;
  switch (type) {
    case 'USERS': {
      const response = await operateGraphQlApi(() => searchUsers(httpApiConfig, query, { after }));
      connection = response?.searchUsers;
      break;
    }
    case 'CONTACTS': {
      const response = await operateGraphQlApi(() =>
        searchContacts(httpApiConfig, Storage.readAccessToken()!, query, { after }),
      );
      connection = response?.searchContacts;
      break;
    }
    case 'BLOCKED_USERS': {
      const response = await operateGraphQlApi(() =>
        searchBlockedUsers(httpApiConfig, Storage.readAccessToken()!, query, { after }),
      );
      connection = response?.searchBlockedUsers;
    }
  }
  if (connection !== undefined) store.dispatch(SearchedUsersSlice.add(connection));
}
