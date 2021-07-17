import React, { ReactElement, useEffect } from 'react';
import { Comment, Row, Space, Spin, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { UserOutlined } from '@ant-design/icons';
import { RootState } from '../../../../store/store';
import { ImagesSlice } from '../../../../store/slices/ImagesSlice';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import CustomImage from '../../CustomImage';
import { Storage } from '../../../../Storage';
import gfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import PollMessageContent from './PollMessageContent';
import GroupChatInviteMessageContent from './GroupChatInviteMessageContent';
import { AccountsSlice } from '../../../../store/slices/AccountsSlice';
import Options from './Options';
import { Username } from '@neelkamath/omni-chat';
import VideoMessageContent from './VideoMessageContent';
import DocMessageContent from './DocMessageContent';
import ImageMessageContent from './ImageMessageContent';
import AudioMessageContent from './AudioMessageContent';
import getLocaleDateString from '../../../../getLocaleDateString';

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
    dispatch(ImagesSlice.fetch({ id: message.sender.userId, type: 'PROFILE_IMAGE' }));
  }, [dispatch, message]);
  const url = useSelector((state: RootState) =>
    ImagesSlice.selectImage(state, 'PROFILE_IMAGE', message.sender.userId, 'THUMBNAIL'),
  );
  const username = useSelector((state: RootState) => AccountsSlice.select(state, message.sender.userId))?.username;
  if (username === undefined) return <Spin />;
  return (
    <Row justify='space-between' align='middle'>
      <Comment
        style={{ maxWidth: 925 } /* <Options> displays on a new line for image messages if we don't set the <width>. */}
        avatar={<CustomImage icon={<UserOutlined />} url={url} />}
        author={<Author username={username} isForwarded={message.isForwarded} />}
        content={<MessageContent message={message} />}
        datetime={getLocaleDateString(message.sent)}
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
    case 'ImageMessage':
      return <ImageMessageContent messageId={message.messageId} />;
    case 'PollMessage':
      return <PollMessageContent message={message as ChatsSlice.PollMessage} />;
    case 'GroupChatInviteMessage':
      return <GroupChatInviteMessageContent inviteCode={(message as ChatsSlice.GroupChatInviteMessage).inviteCode} />;
    case 'DocMessage':
      return <DocMessageContent messageId={message.messageId} />;
    case 'VideoMessage':
      return <VideoMessageContent messageId={message.messageId} />;
    case 'AudioMessage':
      return <AudioMessageContent messageId={message.messageId} />;
    case 'ActionMessage':
      return <>Not implemented.</>;
  }
}
