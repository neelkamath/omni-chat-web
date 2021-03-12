import React, {ReactElement} from 'react';
import {Layout} from 'antd';
import {GroupChat} from '@neelkamath/omni-chat';

export interface GroupChatSectionProps {
  readonly chat: GroupChat;
}

// TODO
export default function GroupChatSection({chat}: GroupChatSectionProps): ReactElement {
  return (
    <Layout>
      <Layout.Header>Header</Layout.Header>
      <Layout.Content>Content</Layout.Content>
    </Layout>
  );
}
