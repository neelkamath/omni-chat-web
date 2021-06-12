import React, { ReactElement, ReactNode } from 'react';
import { Comment, Image, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { UserOutlined } from '@ant-design/icons';
import DeleteAction from './DeleteAction';
import { RootState, useThunkDispatch } from '../../../../store/store';
import { PicsSlice } from '../../../../store/slices/PicsSlice';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import { AccountSlice } from '../../../../store/slices/AccountSlice';
import CustomPic from '../../CustomPic';
import { Storage } from '../../../../Storage';
import gfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { PicMessagesSlice } from '../../../../store/slices/PicMessagesSlice';
import PollMessageContent from './PollMessageContent';

export interface ChatMessageProps {
  readonly message: ChatsSlice.Message;
}

export default function ChatMessage({ message }: ChatMessageProps): ReactElement {
  useThunkDispatch(AccountSlice.fetchAccount());
  const url = useSelector((state: RootState) =>
    PicsSlice.selectPic(state, 'PROFILE_PIC', message.sender.userId, 'THUMBNAIL'),
  );
  let actions: ReactNode[] | undefined;
  if (message.sender.userId === Storage.readUserId()) actions = [<DeleteAction key={1} message={message} />];
  return (
    <Comment
      actions={actions}
      avatar={<CustomPic icon={<UserOutlined />} url={url} />}
      author={message.sender.username}
      content={<MessageContent message={message} />}
      datetime={message.sent}
    />
  );
}

interface MessageContentProps {
  readonly message: ChatsSlice.Message;
}

// @ts-ignore: Function lacks ending return statement and return type does not include 'undefined'.
function MessageContent({ message }: MessageContentProps): ReactElement {
  switch (message.__typename) {
    case 'TextMessage':
      return <ReactMarkdown plugins={[gfm]}>{(message as ChatsSlice.TextMessage).textMessage}</ReactMarkdown>;
    case 'PicMessage':
      return <PicMessageContent messageId={message.messageId} />;
    case 'PollMessage':
      return <PollMessageContent message={message as ChatsSlice.PollMessage} />;
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
