import React, { ReactElement, useState } from 'react';
import { Input } from 'antd';
import { SearchedUsersSlice } from '../../../store/slices/SearchedUsersSlice';
import { useDispatch } from 'react-redux';

export interface SearchUsersFormProps {
  readonly type: SearchedUsersSlice.SearchUsersType;
}

export default function SearchUsersForm({ type }: SearchUsersFormProps): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const onSearch = async (query: string) => {
    setLoading(true);
    dispatch(SearchedUsersSlice.fetchReplacement({ query, type }));
    setLoading(false);
  };
  return <Input.Search loading={isLoading} onSearch={onSearch} enterButton />;
}
