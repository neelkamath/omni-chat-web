import React, { ReactElement, ReactNode } from 'react';
import { Col, Row, Tooltip, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../../../store/store';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import TimeAgo from 'timeago-react';
import { CheckCircleTwoTone, ClockCircleTwoTone } from '@ant-design/icons';
import TextMessage = ChatsSlice.TextMessage;
import ActionMessage = ChatsSlice.ActionMessage;
import PicMessage = ChatsSlice.PicMessage;
import PollMessage = ChatsSlice.PollMessage;

export interface ChatMetadataProps {
  readonly chat: ChatsSlice.Chat;
}

export default function ChatMetadata({ chat }: ChatMetadataProps): ReactElement {
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
          <LastChatMessageText chatId={chat.chatId} />
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
    <Typography.Text ellipsis={true} strong style={{ width: 225 }}>
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

// TODO: Test once all message types have been implemented.
function LastChatMessageText({ chatId }: LastChatMessageTextProps): ReactElement {
  const lastMessage = useSelector((state: RootState) => ChatsSlice.selectLastMessage(state, chatId));
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  if (lastMessage === undefined) return <></>;
  let message: ReactNode;
  switch (lastMessage.__typename) {
    case 'TextMessage':
      message = (lastMessage as TextMessage).textMessage;
      break;
    case 'ActionMessage':
      message = (lastMessage as ActionMessage).actionableMessage.text;
      break;
    case 'PicMessage': {
      const caption = (lastMessage as PicMessage).caption;
      if (caption === null) message = <Typography.Text strong>Sent a picture.</Typography.Text>;
      else message = caption;
      break;
    }
    case 'PollMessage':
      message = (lastMessage as PollMessage).poll.title;
      break;
    case 'AudioMessage':
      message = <Typography.Text strong>Sent an audio.</Typography.Text>;
      break;
    case 'DocMessage':
      message = <Typography.Text strong>Sent a document.</Typography.Text>;
      break;
    case 'GroupChatInviteMessage':
      message = <Typography.Text strong>Sent a group chat invite.</Typography.Text>;
      break;
    case 'VideoMessage':
      message = <Typography.Text strong>Sent a video.</Typography.Text>;
  }
  return (
    <Typography.Text ellipsis={true} style={{ width: 300 }}>
      {lastMessage.sender.username}: {message}
    </Typography.Text>
  );
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
