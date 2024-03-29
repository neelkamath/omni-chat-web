import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChatsSlice } from '../../store/slices/ChatsSlice';
import { Card, Col, Row, Space, Spin, Typography } from 'antd';
import ChatImage from './ChatImage';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';
import { AudioOutlined, FileImageOutlined, FileOutlined, GroupOutlined, VideoCameraOutlined } from '@ant-design/icons';
import gfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import TimeAgo from 'timeago-react';
import ChatName from './ChatName';
import { AccountsSlice } from '../../store/slices/AccountsSlice';
import { RootState } from '../../store/store';

export default function MenuChats(): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChats());
  }, [dispatch]);
  const chats = useSelector(ChatsSlice.selectChats);
  const isLoading = !useSelector(ChatsSlice.selectIsLoaded);
  if (isLoading) return <Spin style={{ padding: 16 }} />;
  const cards = chats.map((chat) => <ChatCard key={chat.chatId} chat={chat} />);
  return <>{cards}</>;
}

interface ChatCardProps {
  readonly chat: ChatsSlice.Chat;
}

function ChatCard({ chat }: ChatCardProps): ReactElement {
  const dispatch = useDispatch();
  return (
    <Card
      size='small'
      hoverable={true}
      onClick={() => dispatch(ChatPageLayoutSlice.update({ type: 'CHAT_SECTION', chatId: chat.chatId }))}
    >
      <Row gutter={16}>
        <Col>
          <ChatImage chat={chat} />
        </Col>
        <Col>
          <ChatMetadata chat={chat} />
        </Col>
      </Row>
    </Card>
  );
}

interface ChatMetadataProps {
  readonly chat: ChatsSlice.Chat;
}

function ChatMetadata({ chat }: ChatMetadataProps): ReactElement {
  return (
    <>
      <Row gutter={16} justify='space-between'>
        <Col>
          <ChatName data={chat} />
        </Col>
        <Col>
          <LastMessageTimeAgo chatId={chat.chatId} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col>
          <LastChatMessage chatId={chat.chatId} />
        </Col>
      </Row>
    </>
  );
}

interface LastMessageTimeAgoProps {
  readonly chatId: number;
}

function LastMessageTimeAgo({ chatId }: LastMessageTimeAgoProps): ReactElement {
  const lastMessage = useSelector((state: RootState) => ChatsSlice.selectLastMessage(state, chatId));
  if (lastMessage === undefined) return <></>;
  return (
    <Typography.Text type='secondary'>
      <TimeAgo datetime={lastMessage.sent} opts={{ minInterval: 60 }} />
    </Typography.Text>
  );
}

interface LastChatMessageTextProps {
  readonly chatId: number;
}

function LastChatMessage({ chatId }: LastChatMessageTextProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChat(chatId));
  }, [dispatch, chatId]);
  const isLoading = !useSelector(ChatsSlice.selectIsLoaded);
  const lastMessage = useSelector((state: RootState) => ChatsSlice.selectLastMessage(state, chatId));
  useEffect(() => {
    if (lastMessage?.sender.userId !== undefined) dispatch(AccountsSlice.fetchAccount(lastMessage.sender.userId));
  }, [dispatch, lastMessage]);
  const username = useSelector((state: RootState) => AccountsSlice.select(state, lastMessage?.sender.userId))?.username;
  if (isLoading || (lastMessage !== undefined && username === undefined)) return <Spin />;
  if (lastMessage === undefined) return <></>;
  return (
    <Typography.Text ellipsis style={{ width: 333 }}>
      <Space>
        <Typography.Paragraph>{username}:</Typography.Paragraph>
        <Typography.Paragraph style={{ height: 22 }}>
          <LastChatMessageContent message={lastMessage} />
        </Typography.Paragraph>
      </Space>
    </Typography.Text>
  );
}

interface LastChatMessageContentProps {
  readonly message: ChatsSlice.Message;
}

function LastChatMessageContent({ message }: LastChatMessageContentProps): ReactElement {
  switch (message.__typename) {
    case 'TextMessage':
      return <ReactMarkdown plugins={[gfm]}>{(message as ChatsSlice.TextMessage).textMessage}</ReactMarkdown>;
    case 'ActionMessage':
      return (
        <ReactMarkdown plugins={[gfm]}>{(message as ChatsSlice.ActionMessage).actionableMessage.text}</ReactMarkdown>
      );
    case 'ImageMessage': {
      const caption = (message as ChatsSlice.ImageMessage).caption;
      return caption === null ? <FileImageOutlined /> : <ReactMarkdown plugins={[gfm]}>{caption}</ReactMarkdown>;
    }
    case 'PollMessage':
      return <ReactMarkdown plugins={[gfm]}>{(message as ChatsSlice.PollMessage).poll.question}</ReactMarkdown>;
    case 'AudioMessage':
      return <AudioOutlined />;
    case 'DocMessage':
      return <FileOutlined />;
    case 'GroupChatInviteMessage':
      return <GroupOutlined />;
    case 'VideoMessage':
      return <VideoCameraOutlined />;
  }
}
