import { GroupChatDescription, GroupChatTitle, queryOrMutate, Uuid } from '@neelkamath/omni-chat';
import React, { ReactElement, useState } from 'react';
import { Button, Card, Col, message, Row, Space } from 'antd';
import GroupChatTags from './chat-section/GroupChatTags';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { Storage } from '../../Storage';
import store from '../../store/store';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';

export interface GroupChatInvitationProps {
  /**
   * If it's a `number`, then the value is the ID of a public chat. If it's a {@link Uuid}, then the value is the invite
   * code of a group chat.
   */
  readonly data: number | Uuid;
  readonly title: GroupChatTitle;
  readonly description: GroupChatDescription;
  readonly isBroadcast: boolean;
  readonly publicity: GroupChatPublicity;
}

export type GroupChatPublicity = 'INVITABLE' | 'NOT_INVITABLE' | 'PUBLIC';

// TODO: Once Omni Chat Backend 0.23.0 releases, disable the join button if the user is already in the chat.
export default function GroupChatInvitation({
  data,
  description,
  publicity,
  title,
  isBroadcast,
}: GroupChatInvitationProps): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    typeof data === 'number' ? await operateJoinPublicChat(data) : await operateJoinGroupChat(data);
    setLoading(false);
  };
  return (
    <Card>
      {/* TODO: Once Omni ChatBackend 0.23.0 releases, pass the invited chat's ID to <Card.Meta>: avatar={<GroupChatPic chatId={chatId} />} */}
      <Card.Meta
        title={
          <Row gutter={16} justify='space-between'>
            <Col>{title}</Col>
            <Col>
              <GroupChatTags isBroadcast={isBroadcast} publicity={publicity} />
            </Col>
          </Row>
        }
        description={
          <Space direction='vertical'>
            <ReactMarkdown plugins={[gfm]}>{description}</ReactMarkdown>
            <Button type='primary' loading={isLoading} onClick={onClick}>
              Join
            </Button>
          </Space>
        }
      />
    </Card>
  );
}

async function operateJoinPublicChat(chatId: number): Promise<void> {
  const result = await joinPublicChat(chatId);
  if (result?.joinPublicChat === null) {
    message.success("You've joined the chat.", 5);
    store.dispatch(ChatPageLayoutSlice.update({ type: 'CHAT_SECTION', chatId })); // FIXME: Doesn't open the chat.
  } else if (result?.joinPublicChat.__typename === 'InvalidChatId') message.error('The chat no longer exists.', 5);
}

async function operateJoinGroupChat(inviteCode: Uuid): Promise<void> {
  const result = await joinGroupChat(inviteCode);
  if (result?.joinGroupChat === null) {
    message.success("You've joined the chat.", 5);
    // TODO: Once Omni Chat Backend 0.23.0 releases, open the chat upon joining: store.dispatch(ChatPageLayoutSlice.update({ type: 'CHAT_SECTION', chatId }));
  } else if (result?.joinGroupChat.__typename === 'InvalidInviteCode')
    message.error('The chat is no longer accepting invitations.', 5);
}

interface JoinGroupChatResult {
  readonly joinGroupChat: InvalidInviteCode | null;
}

interface InvalidInviteCode {
  readonly __typename: 'InvalidInviteCode';
}

async function joinGroupChat(inviteCode: Uuid): Promise<JoinGroupChatResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation JoinGroupChat($inviteCode: Uuid!) {
              joinGroupChat(inviteCode: $inviteCode) {
                __typename
              }
            }
          `,
          variables: { inviteCode },
        },
        Storage.readAccessToken()!,
      ),
  );
}

interface JoinPublicChatResult {
  readonly joinPublicChat: InvalidChatId | null;
}

interface InvalidChatId {
  readonly __typename: 'InvalidChatId';
}

async function joinPublicChat(chatId: number): Promise<JoinPublicChatResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation JoinPublicChat($chatId: Int!) {
              joinPublicChat(chatId: $chatId) {
                __typename
              }
            }
          `,
          variables: { chatId },
        },
        Storage.readAccessToken()!,
      ),
  );
}
