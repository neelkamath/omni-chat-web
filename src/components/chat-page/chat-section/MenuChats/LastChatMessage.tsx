import {
  ActionMessage,
  Chat,
  GroupChat,
  PicMessage,
  PollMessage,
  PrivateChat,
  TextMessage,
} from '@neelkamath/omni-chat';
import React, { ReactElement } from 'react';
import { Col, Row, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../../../store/store';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import TimeAgo from 'timeago-react';
import { CheckCircleTwoTone, ClockCircleTwoTone } from '@ant-design/icons';

export interface LastChatMessageProps {
  readonly chat: Chat;
}

export default function LastChatMessage({ chat }: LastChatMessageProps): ReactElement {
  return (
    <>
      <Row gutter={16}>
        <Col>
          <ChatName chat={chat} />
        </Col>
        <Col>
          <LastMessageTimeAgo chatId={chat.id} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col>
          <LastChatMessageText chatId={chat.id} />
        </Col>
        <Col>
          <LastMessageStatus chatId={chat.id} />
        </Col>
      </Row>
    </>
  );
}

interface ChatNameProps {
  readonly chat: Chat;
}

function ChatName({ chat }: ChatNameProps): ReactElement {
  let name;
  switch (chat.__typename) {
    case 'GroupChat':
      name = (chat as GroupChat).title;
      break;
    case 'PrivateChat':
      name = (chat as PrivateChat).user.username;
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
      <TimeAgo datetime={lastMessage.dateTimes.sent} opts={{ minInterval: 60 }} />
    </Typography.Text>
  );
}

interface LastChatMessageTextProps {
  readonly chatId: number;
}

function LastChatMessageText({ chatId }: LastChatMessageTextProps): ReactElement {
  const lastMessage = useSelector((state: RootState) => ChatsSlice.selectLastMessage(state, chatId));
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  if (lastMessage === undefined) return <></>;
  let message;
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
    <Typography.Text ellipsis={true}>
      {lastMessage.sender.username}: {message}
    </Typography.Text>
  );
}

interface LastMessageStatusProps {
  readonly chatId: number;
}

function LastMessageStatus({ chatId }: LastMessageStatusProps): ReactElement {
  const dateTimes = useSelector((state: RootState) => ChatsSlice.selectLastMessage(state, chatId))?.dateTimes;
  if (dateTimes === undefined) return <></>;
  return (
    <>
      {/*
      TODO: Implement this once Omni Chat Backend 0.17.0 is released.
       - Show sent/delivered/read status.
       - Use a tooltip to tell the user which status which icon means:
        - Blue ClockCircleTwoTone = sending
        - Green ClockCircleTwoTone = sent
        - Blue CheckCircleTwoTone = delivered
        - Green CheckCircleTwoTone = read
      */}
      <ClockCircleTwoTone twoToneColor='#53C51A' />
      <CheckCircleTwoTone />
    </>
  );
}
