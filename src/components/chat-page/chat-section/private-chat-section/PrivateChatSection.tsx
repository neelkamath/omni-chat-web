import React, { ReactElement } from 'react';
import { Layout } from 'antd';
import ChatMessage from '../ChatMessage';
import { PrivateChat } from '@neelkamath/omni-chat';
import Header from './Header';
import MessageCreator from './MessageCreator';

export interface PrivateChatSectionProps {
  readonly chat: PrivateChat;
}

/*
TODO: Use a scroller so that messages don't overflow the screen, and we get scroll events to now when to load more. Use
 https://ant.design/components/list/?theme=dark#components-list-demo-infinite-load.
 */
export default function PrivateChatSection({ chat }: PrivateChatSectionProps): ReactElement {
  return (
    <Layout>
      <Layout.Header>
        <Header user={chat.user} chatId={chat.id} />
      </Layout.Header>
      <Layout.Content style={{ padding: 16 }}>
        {chat.messages.edges.map(({ node }) => (
          <ChatMessage key={node.messageId} message={node} />
        ))}
        <MessageCreator chatId={chat.id} />
      </Layout.Content>
    </Layout>
  );
}
