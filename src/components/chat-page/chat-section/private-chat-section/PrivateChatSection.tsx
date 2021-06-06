import React, { ReactElement } from 'react';
import { Layout } from 'antd';
import ChatMessage from '../ChatMessage';
import Header from './Header';
import MessageCreator from './MessageCreator';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';

export interface PrivateChatSectionProps {
  readonly chat: ChatsSlice.PrivateChat;
}

export default function PrivateChatSection({ chat }: PrivateChatSectionProps): ReactElement {
  return (
    <Layout>
      <Layout.Header>
        <Header user={chat.user} chatId={chat.chatId} />
      </Layout.Header>
      <Layout.Content style={{ padding: 16 }}>
        {chat.messages.edges.map(({ node }) => (
          <ChatMessage key={node.messageId} message={node} />
        ))}
        <MessageCreator chatId={chat.chatId} />
      </Layout.Content>
    </Layout>
  );
}
