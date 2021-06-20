import React, { ReactElement, ReactNode } from 'react';
import { Comment, Image, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { UserOutlined } from '@ant-design/icons';
import DeleteAction from './DeleteAction';
import { RootState, useThunkDispatch } from '../../../../store/store';
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

export interface ChatMessageProps {
  readonly message: ChatsSlice.Message;
  readonly chatId: number;
}

export default function ChatMessage({ message, chatId }: ChatMessageProps): ReactElement {
  useThunkDispatch(AccountsSlice.fetch(Storage.readUserId()!));
  useThunkDispatch(PicsSlice.fetch({ id: message.sender.userId, type: 'PROFILE_PIC' }));
  const url = useSelector((state: RootState) =>
    PicsSlice.selectPic(state, 'PROFILE_PIC', message.sender.userId, 'THUMBNAIL'),
  );
  const username = useSelector((state: RootState) => AccountsSlice.select(state, message.sender.userId))?.username;
  if (username === undefined) return <Spin />;
  let actions: ReactNode[] | undefined;
  if (message.sender.userId === Storage.readUserId()) actions = [<DeleteAction key={1} message={message} />];
  return (
    <Comment
      actions={actions}
      avatar={<CustomPic icon={<UserOutlined />} url={url} />}
      author={username}
      content={<MessageContent chatId={chatId} message={message} />}
      datetime={message.sent}
    />
  );
}

interface MessageContentProps {
  readonly message: ChatsSlice.Message;
  readonly chatId: number;
}

function MessageContent({ message, chatId }: MessageContentProps): ReactElement {
  switch (message.__typename) {
    case 'TextMessage':
      return <ReactMarkdown plugins={[gfm]}>{(message as ChatsSlice.TextMessage).textMessage}</ReactMarkdown>;
    case 'PicMessage':
      return <PicMessageContent messageId={message.messageId} />;
    case 'PollMessage':
      return <PollMessageContent message={message as ChatsSlice.PollMessage} />;
    case 'GroupChatInviteMessage':
      return (
        <GroupChatInviteMessageContent
          chatId={chatId}
          inviteCode={(message as ChatsSlice.GroupChatInviteMessage).inviteCode}
        />
      );
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
  useThunkDispatch(PicMessagesSlice.fetch(messageId));
  const url = useSelector((state: RootState) => PicMessagesSlice.selectPic(state, messageId)).originalUrl;
  return url === undefined ? <Spin size='small' /> : <Image src={url} width='50%' />;
}
