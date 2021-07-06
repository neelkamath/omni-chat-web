import { GroupChatDescription, GroupChatPublicity, GroupChatTitle, queryOrMutate, Uuid } from '@neelkamath/omni-chat';
import React, { ReactElement, useState } from 'react';
import { Button, Card, Col, message, Row, Space } from 'antd';
import GroupChatTags from './chat-section/GroupChatTags';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { Storage } from '../../Storage';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';
import { useDispatch } from 'react-redux';
import GroupChatPic from './GroupChatPic';

export interface GroupChatInvitationProps {
  /**
   * If it's a `number`, then the value is the ID of a public chat. If it's a {@link Uuid}, then the value is the invite
   * code of a group chat.
   */
  readonly data: number | Uuid;
  readonly invitedChatId: number;
  readonly title: GroupChatTitle;
  readonly description: GroupChatDescription;
  readonly isBroadcast: boolean;
  readonly publicity: GroupChatPublicity;
}

export default function GroupChatInvitation({
  data,
  invitedChatId,
  description,
  publicity,
  title,
  isBroadcast,
}: GroupChatInvitationProps): ReactElement {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    const hasJoined = typeof data === 'number' ? await operateJoinPublicChat(data) : await operateJoinGroupChat(data);
    setLoading(false);
    if (hasJoined) dispatch(ChatPageLayoutSlice.update({ type: 'CHAT_SECTION', chatId: invitedChatId }));
  };
  return (
    <Card>
      <Card.Meta
        avatar={<GroupChatPic chatId={invitedChatId} />}
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

/** @returns boolean Whether the `chatId` was joined. */
async function operateJoinPublicChat(chatId: number): Promise<boolean> {
  const result = await joinPublicChat(chatId);
  if (result?.joinPublicChat === null) {
    message.success("You've joined the chat.", 5);
    return true;
  } else if (result?.joinPublicChat.__typename === 'InvalidChatId') message.error('The chat no longer exists.', 5);
  return false;
}

/** @returns boolean Whether the `chatId` was joined. */
async function operateJoinGroupChat(inviteCode: Uuid): Promise<boolean> {
  const result = await joinGroupChat(inviteCode);
  if (result?.joinGroupChat === null) {
    message.success("You've joined the chat.", 5);
    return true;
  } else if (result?.joinGroupChat.__typename === 'InvalidInviteCode')
    message.error('The chat is no longer accepting invitations.', 5);
  return false;
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
