import React, { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChatsSlice } from '../../store/slices/ChatsSlice';
import { Card, Col, Row, Spin, Tooltip, Typography } from 'antd';
import { RootState, useThunkDispatch } from '../../store/store';
import ChatPic from './ChatPic';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';
import {
  AudioOutlined,
  CheckCircleTwoTone,
  ClockCircleTwoTone,
  FileImageOutlined,
  FileOutlined,
  GroupOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import gfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import TimeAgo from 'timeago-react';

export default function MenuChats(): ReactElement {
  const chats = useSelector(ChatsSlice.selectChats);
  const isLoading = !useSelector(ChatsSlice.selectIsLoaded);
  useThunkDispatch(ChatsSlice.fetchChats());
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
          <ChatPic chat={chat} />
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
          <ChatName chat={chat} />
        </Col>
        <Col>
          <LastMessageTimeAgo chatId={chat.chatId} />
        </Col>
      </Row>
      <Row gutter={16} justify='space-between'>
        <Col>
          <LastChatMessage chatId={chat.chatId} />
        </Col>
        <Col>
          <LastMessageStatus chatId={chat.chatId} />
        </Col>
      </Row>
    </>
  );
}

interface ChatNameProps {
  readonly chat: ChatsSlice.Chat;
}

function ChatName({ chat }: ChatNameProps): ReactElement {
  let name: string;
  switch (chat.__typename) {
    case 'GroupChat':
      name = (chat as ChatsSlice.GroupChat).title;
      break;
    case 'PrivateChat':
      name = (chat as ChatsSlice.PrivateChat).user.username;
  }
  return (
    <Typography.Text ellipsis={true} strong style={{ width: 200 }}>
      {name}
    </Typography.Text>
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
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const lastMessage = useSelector((state: RootState) => ChatsSlice.selectLastMessage(state, chatId));
  if (lastMessage === undefined) return <></>;
  return (
    <Typography.Text ellipsis={true} style={{ width: 300 }}>
      {lastMessage.sender.username}: <LastChatMessageContent message={lastMessage} />
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
    case 'PicMessage': {
      const caption = (message as ChatsSlice.PicMessage).caption;
      return caption === null ? <FileImageOutlined /> : <ReactMarkdown plugins={[gfm]}>{caption}</ReactMarkdown>;
    }
    case 'PollMessage':
      return <ReactMarkdown plugins={[gfm]}>{(message as ChatsSlice.PollMessage).poll.title}</ReactMarkdown>;
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

interface LastMessageStatusProps {
  readonly chatId: number;
}

function LastMessageStatus({ chatId }: LastMessageStatusProps): ReactElement {
  const state = useSelector((state: RootState) => ChatsSlice.selectLastMessage(state, chatId))?.state;
  switch (state) {
    case undefined:
      return <></>;
    case 'SENT':
      return (
        <Tooltip title='Sent'>
          <ClockCircleTwoTone twoToneColor='#53C51A' />
        </Tooltip>
      );
    case 'DELIVERED':
      return (
        <Tooltip title='Delivered'>
          <CheckCircleTwoTone twoToneColor='#41A8FE' />
        </Tooltip>
      );
    case 'READ':
      return (
        <Tooltip title='Read'>
          <CheckCircleTwoTone twoToneColor='#53C51A' />
        </Tooltip>
      );
  }
}
