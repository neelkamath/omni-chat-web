import React, { ReactElement, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SearchedUsersSlice } from '../../../store/slices/SearchedUsersSlice';
import { Button } from 'antd';

export interface LoadMoreUsersButtonProps {
  readonly type: SearchedUsersSlice.SearchUsersType;
}

export default function LoadMoreUsersButton({ type }: LoadMoreUsersButtonProps): ReactElement {
  const hasNextPage = useSelector(SearchedUsersSlice.selectHasNextPage);
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    dispatch(SearchedUsersSlice.fetchAdditional(type));
    setLoading(false);
  };
  return (
    <Button loading={isLoading} disabled={!hasNextPage} onClick={onClick}>
      {hasNextPage ? 'Load' : 'No'} more users
    </Button>
  );
}
