import React, { ReactElement, useEffect } from 'react';
import { Comment, Image, Row, Space, Spin, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { UserOutlined } from '@ant-design/icons';
import { RootState } from '../../../../store/store';
import { PicsSlice } from '../../../../store/slices/PicsSlice';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import CustomPic from '../../CustomPic';
import { Storage } from '../../../../Storage';
import gfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { PicMessagesSlice } from '../../../../store/slices/PicMessagesSlice';
import PollMessageContent from './PollMessageContent';
import GroupChatInviteMessageContent from './GroupChatInviteMessageContent';
import { AccountsSlice } from '../../../../store/slices/AccountsSlice';
import Options from './Options';
import { Username } from '@neelkamath/omni-chat';

export interface ChatMessageProps {
  readonly chatId: number;
  readonly message: ChatsSlice.Message;
}

export default function ChatMessage({ chatId, message }: ChatMessageProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(AccountsSlice.fetch(Storage.readUserId()!));
  }, [dispatch]);
  useEffect(() => {
    dispatch(PicsSlice.fetch({ id: message.sender.userId, type: 'PROFILE_PIC' }));
  }, [dispatch, message]);
  const url = useSelector((state: RootState) =>
    PicsSlice.selectPic(state, 'PROFILE_PIC', message.sender.userId, 'THUMBNAIL'),
  );
  const username = useSelector((state: RootState) => AccountsSlice.select(state, message.sender.userId))?.username;
  if (username === undefined) return <Spin />;
  // TODO: Make the <datetime> human-readable.
  return (
    <Row justify='space-between' align='middle'>
      <Comment
        avatar={<CustomPic icon={<UserOutlined />} url={url} />}
        author={<Author username={username} isForwarded={message.isForwarded} />}
        content={<MessageContent message={message} />}
        datetime={message.sent}
      />
      <Options chatId={chatId} message={message} />
    </Row>
  );
}

interface AuthorProps {
  readonly username: Username;
  readonly isForwarded: boolean;
}

function Author({ username, isForwarded }: AuthorProps): ReactElement {
  return (
    <Space>
      {username}
      {isForwarded && <Typography.Text italic>(forwarded)</Typography.Text>}
    </Space>
  );
}

interface MessageContentProps {
  readonly message: ChatsSlice.Message;
}

function MessageContent({ message }: MessageContentProps): ReactElement {
  switch (message.__typename) {
    case 'TextMessage':
      return <ReactMarkdown plugins={[gfm]}>{(message as ChatsSlice.TextMessage).textMessage}</ReactMarkdown>;
    case 'PicMessage':
      return <PicMessageContent messageId={message.messageId} />;
    case 'PollMessage':
      return <PollMessageContent message={message as ChatsSlice.PollMessage} />;
    case 'GroupChatInviteMessage':
      return <GroupChatInviteMessageContent inviteCode={(message as ChatsSlice.GroupChatInviteMessage).inviteCode} />;
    case 'ActionMessage':
    case 'AudioMessage':
    case 'DocMessage':
    case 'VideoMessage':
      return <>Not implemented.</>;
  }
}

interface PicMessageContentProps {
  readonly messageId: number;
}

function PicMessageContent({ messageId }: PicMessageContentProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(PicMessagesSlice.fetch(messageId));
  }, [dispatch, messageId]);
  const url = useSelector((state: RootState) => PicMessagesSlice.selectPic(state, messageId)).originalUrl;
  // FIXME: Set the width to be at most 50% instead of 50% because otherwise small images get enlarged excessively.
  return url === undefined ? <Spin size='small' /> : <Image src={url} width='25%' />;
}
