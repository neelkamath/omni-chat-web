import React, { ReactElement, useEffect, useState } from 'react';
import { Divider, Empty, Layout, message, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { RootState, useThunkDispatch } from '../../../store/store';
import Header from './Header';
import MessageCreator from './message-creator/MessageCreator';
import ChatMessage from './chat-message/ChatMessage';

export interface ChatSectionProps {
  readonly chatId: number;
}

export default function ChatSection({ chatId }: ChatSectionProps): ReactElement {
  const [section, setSection] = useState(<Spin style={{ padding: 16 }} />);
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const isDeletedPrivateChat = useSelector((state: RootState) => ChatsSlice.selectIsDeletedPrivateChat(state, chatId));
  const chat = useSelector((state: RootState) => ChatsSlice.selectChat(state, chatId));
  const onDeletedChat = () => {
    message.warning('This chat has just been deleted.', 5);
    setSection(<Empty />);
  };
  useEffect(() => {
    if (isDeletedPrivateChat) onDeletedChat();
  }, [isDeletedPrivateChat]);
  useEffect(() => {
    if (chat?.__typename === 'PrivateChat') setSection(<ChatSegment chat={chat as ChatsSlice.PrivateChat} />);
    else if (chat?.__typename === 'GroupChat') setSection(<ChatSegment chat={chat as ChatsSlice.GroupChat} />);
  }, [chat]);
  return section;
}

interface ChatSegmentProps {
  readonly chat: ChatsSlice.PrivateChat | ChatsSlice.GroupChat;
}

function ChatSegment({ chat }: ChatSegmentProps): ReactElement {
  const isBroadcast = chat.__typename === 'GroupChat' && chat.isBroadcast;
  return (
    <Layout>
      <Layout.Header>
        <Header chat={chat} />
      </Layout.Header>
      <Layout.Content style={{ padding: 16 }}>
        {chat.messages.edges.map(({ node }) => (
          <ChatMessage key={node.messageId} message={node} />
        ))}
        {chat.messages.edges.length > 0 && <Divider />}
        {isBroadcast ? 'Only admins can send messages in this chat.' : <MessageCreator chatId={chat.chatId} />}
      </Layout.Content>
    </Layout>
  );
}
