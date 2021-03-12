import React, { ReactElement, useState } from 'react';
import { Button, Empty, Form, Input, Space, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Storage } from '../../Storage';
import UserCard from './UserCard';
import { useDispatch, useSelector } from 'react-redux';
import { SearchedContactsSlice } from '../../store/slices/SearchedContactsSlice';
import { QueriesApiWrapper } from '../../api/QueriesApiWrapper';

export default function ContactsSection(): ReactElement {
  return (
    <Space direction='vertical' style={{ padding: 16 }}>
      Search contacts by their name, username, or email address.
      <Space direction='vertical'>
        <SearchContactsForm />
        <Contacts />
      </Space>
    </Space>
  );
}

interface SearchContactsFormData {
  readonly query: string;
}

function SearchContactsForm(): ReactElement {
  const query = useSelector(SearchedContactsSlice.selectQuery);
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const onFinish = async (data: SearchContactsFormData) => {
    setLoading(true);
    const response = await QueriesApiWrapper.searchContacts(data.query);
    setLoading(false);
    if (response !== undefined) dispatch(SearchedContactsSlice.overwrite({ query: data.query, contacts: response }));
  };
  return (
    <Form onFinish={onFinish} name='searchContacts' layout='inline'>
      <Form.Item name='query' initialValue={query === undefined ? '' : query}>
        <Input />
      </Form.Item>
      <Form.Item>
        <Button loading={isLoading} type='primary' htmlType='submit' icon={<SearchOutlined />} />
      </Form.Item>
    </Form>
  );
}

function Contacts(): ReactElement {
  const contacts = useSelector(SearchedContactsSlice.selectContacts);
  const dispatch = useDispatch();
  if (contacts === undefined) {
    QueriesApiWrapper.readContacts().then((response) => {
      if (response !== undefined) dispatch(SearchedContactsSlice.overwrite({ contacts: response }));
    });
    return <Spin />;
  }
  const cards = contacts
    .filter(({ node }) => node.id !== Storage.readUserId()!)
    .map(({ node }) => <UserCard key={node.id} account={node} />);
  return cards.length === 0 ? <Empty /> : <Space direction='vertical'>{cards}</Space>;
}
