import React, { ReactElement, useEffect } from 'react';
import { Button, Comment, Image, Row, Space, Spin, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { DownloadOutlined, UserOutlined } from '@ant-design/icons';
import { RootState } from '../../../../store/store';
import { ImagesSlice } from '../../../../store/slices/ImagesSlice';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import CustomImage from '../../CustomImage';
import { Storage } from '../../../../Storage';
import gfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { ImageMessagesSlice } from '../../../../store/slices/ImageMessagesSlice';
import PollMessageContent from './PollMessageContent';
import GroupChatInviteMessageContent from './GroupChatInviteMessageContent';
import { AccountsSlice } from '../../../../store/slices/AccountsSlice';
import Options from './Options';
import { DateTime, Username } from '@neelkamath/omni-chat';
import { DocMessagesSlice } from '../../../../store/slices/DocMessagesSlice';
import { VideoMessagesSlice } from '../../../../store/slices/VideoMessagesSlice';

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
        datetime={getDateTime(message.sent)}
      />
      <Options chatId={chatId} message={message} />
    </Row>
  );
}

function getDateTime(dateTime: DateTime): string {
  const locale = undefined; // Set the locale to <undefined> to use the user's default locale.
  return new Date(dateTime).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
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
    case 'ActionMessage':
    case 'AudioMessage':
      return <>Not implemented.</>;
  }
}

interface ImageMessageContentProps {
  readonly messageId: number;
}

function ImageMessageContent({ messageId }: ImageMessageContentProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ImageMessagesSlice.fetch(messageId));
  }, [dispatch, messageId]);
  const url = useSelector((state: RootState) => ImageMessagesSlice.selectImage(state, messageId)).originalUrl;
  // FIXME: Set the width to be at most 50% instead of 50% because otherwise small images get enlarged excessively. Check what happens if you put a thin but tall image.
  return url === undefined ? <Spin size='small' /> : <Image src={url} width='33%' />;
}

interface VideoMessageContentProps {
  readonly messageId: number;
}

function VideoMessageContent({ messageId }: VideoMessageContentProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(VideoMessagesSlice.fetch(messageId));
  }, [dispatch, messageId]);
  const url = useSelector((state: RootState) => VideoMessagesSlice.selectVideo(state, messageId));
  /*
  FIXME: Doesn't work in Safari. This should get fixed once we migrate to a CDN because Safari apparently requires the
   server to support media range requests. Otherwise, try a third party player to see if that fixes it.
   */
  return url === undefined ? <Spin size='small' /> : <video controls src={url} width='33%' />;
}

interface DocMessageContentProps {
  readonly messageId: number;
}

function DocMessageContent({ messageId }: DocMessageContentProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(DocMessagesSlice.fetch(messageId));
  }, [dispatch, messageId]);
  const file = useSelector((state: RootState) => DocMessagesSlice.selectFile(state, messageId));
  if (file.url === undefined) return <Spin />;
  return (
    <Button>
      <Typography.Link download={file.filename} href={file.url}>
        <Space>
          <DownloadOutlined /> Download {file.filename}
        </Space>
      </Typography.Link>
    </Button>
  );
}
