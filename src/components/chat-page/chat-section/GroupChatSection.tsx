import React, { ReactElement } from 'react';
import { Layout, Tag } from 'antd';
import { GroupChat } from '@neelkamath/omni-chat';

export interface GroupChatSectionProps {
  readonly chat: GroupChat;
}

// TODO
export default function GroupChatSection({ chat }: GroupChatSectionProps): ReactElement {
  return (
    <Layout>
      <Layout.Header>
        <ChatTags chat={chat} />
      </Layout.Header>
      <Layout.Content>Content</Layout.Content>
    </Layout>
  );
}

interface ChatTagsProps {
  readonly chat: GroupChat;
}

// TODO: Test.
function ChatTags({ chat }: ChatTagsProps): ReactElement {
  const tags = [];
  tags.push(
    <Tag key='group' color='green'>
      Group
    </Tag>,
  );
  if (chat.publicity === 'PUBLIC')
    tags.push(
      <Tag key='public' color='blue'>
        Public
      </Tag>,
    );
  if (chat.isBroadcast)
    tags.push(
      <Tag key='broadcast' color='cyan'>
        Broadcast
      </Tag>,
    );
  return <>{tags}</>;
}
