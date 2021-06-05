import React, { ReactElement } from 'react';
import { Layout } from 'antd';
import ChatMessage from '../ChatMessage';
import Header from './Header';
import MessageCreator from './MessageCreator';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';

export interface PrivateChatSectionProps {
  readonly chat: ChatsSlice.PrivateChat;
}

/*
TODO: Use a scroller so that messages don't overflow the screen, and we get scroll events to know when to load more. Use
 https://ant.design/components/list/?theme=dark#components-list-demo-infinite-load.
 */
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
