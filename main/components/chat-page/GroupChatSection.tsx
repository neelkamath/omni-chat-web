import {GroupChat} from '../../api/networking/graphql/models';
import React, {ReactElement} from 'react';
import {Layout} from 'antd';

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
