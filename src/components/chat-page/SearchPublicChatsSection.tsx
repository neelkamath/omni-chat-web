import React, { ReactElement, useState } from 'react';
import { Button, Card, Divider, Input, Space, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { SearchedPublicChatsSlice } from '../../store/slices/SearchedPublicChatsSlice';
import GroupChatPic from './GroupChatPic';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';

export default function SearchPublicChatsSection(): ReactElement {
  const query = useSelector(SearchedPublicChatsSlice.selectQuery);
  return (
    <Space direction='vertical' style={{ padding: 16 }}>
      <Typography.Text>Search public chats by their titles.</Typography.Text>
      <Space direction='vertical'>
        <SearchChatsForm />
        <Chats />
        {query !== undefined && <LoadMoreChatsButton />}
      </Space>
    </Space>
  );
}

function Chats(): ReactElement {
  const chats = useSelector(SearchedPublicChatsSlice.selectAll);
  const cards = chats.map(({ node }) => <ChatCard key={node.chatId} chat={node} />);
  return <Space direction='vertical'>{cards}</Space>;
}

interface ChatCardProps {
  readonly chat: SearchedPublicChatsSlice.GroupChat;
}

function ChatCard({ chat }: ChatCardProps): ReactElement {
  const dispatch = useDispatch();
  const onClick = () => dispatch(ChatPageLayoutSlice.update({ type: 'CHAT_SECTION', chatId: chat.chatId }));
  return (
    <Card hoverable={true} onClick={onClick}>
      <Space>
        <GroupChatPic chatId={chat.chatId} />
        <Typography.Text strong>{chat.title}</Typography.Text>
      </Space>
      {chat.description.length > 0 && (
        <>
          <Divider />
          <ReactMarkdown plugins={[gfm]}>{chat.description}</ReactMarkdown>
        </>
      )}
    </Card>
  );
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
