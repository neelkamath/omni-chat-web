import React, { ReactElement, useState } from 'react';
import { Button, Input, Space, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { SearchedPublicChatsSlice } from '../../store/slices/SearchedPublicChatsSlice';
import GroupChatInvitation from './GroupChatInvitation';
import { FileSearchOutlined } from '@ant-design/icons';

export default function SearchPublicChatsSection(): ReactElement {
  const query = useSelector(SearchedPublicChatsSlice.selectQuery);
  return (
    <Space direction='vertical' style={{ padding: 16 }}>
      <Title />
      <Typography.Text>Search public chats by their titles.</Typography.Text>
      <Space direction='vertical'>
        <SearchChatsForm />
        <Chats />
        {query !== undefined && <LoadMoreChatsButton />}
      </Space>
    </Space>
  );
}

function Title(): ReactElement {
  return (
    <Typography.Title level={2}>
      <Space>
        <FileSearchOutlined />
        Search Public Chats
      </Space>
    </Typography.Title>
  );
}

function Chats(): ReactElement {
  const chats = useSelector(SearchedPublicChatsSlice.selectAll);
  const cards = chats.map(({ node }) => (
    <GroupChatInvitation invitedChatId={node.chatId} key={node.chatId} data={node.chatId} {...node} />
  ));
  return <Space direction='vertical'>{cards}</Space>;
}

function LoadMoreChatsButton(): ReactElement {
  const hasNextPage = useSelector(SearchedPublicChatsSlice.selectHasNextPage);
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    dispatch(SearchedPublicChatsSlice.fetchAdditional());
    setLoading(false);
  };
  return (
    <Button loading={isLoading} disabled={!hasNextPage} onClick={onClick}>
      {hasNextPage ? 'Load' : 'No'} more chats
    </Button>
  );
}

function SearchChatsForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const onSearch = async (query: string) => {
    setLoading(true);
    dispatch(SearchedPublicChatsSlice.fetchReplacement(query));
    setLoading(false);
  };
  return <Input.Search loading={isLoading} onSearch={onSearch} enterButton />;
}
