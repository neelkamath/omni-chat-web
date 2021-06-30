import React, { ReactElement, useEffect, useState } from 'react';
import { GroupChatDescription, GroupChatTitle, queryOrMutate, Uuid } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { Storage } from '../../../../Storage';
import { Button, Card, Col, message, Row, Space, Spin } from 'antd';
import GroupChatTags from '../GroupChatTags';
import gfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';

export interface GroupChatInviteMessageContentProps {
  readonly inviteCode: Uuid | null;
}

export default function GroupChatInviteMessageContent({
  inviteCode,
}: GroupChatInviteMessageContentProps): ReactElement {
  const [section, setSection] = useState(inviteCode === null ? <InvalidGroupChatInvite /> : <Spin />);
  useEffect(() => {
    if (inviteCode !== null)
      readGroupChat(inviteCode).then((response) => {
        switch (response?.readGroupChat.__typename) {
          case 'GroupChatInfo':
            setSection(<GroupChatInvitation inviteCode={inviteCode} info={response.readGroupChat} />);
            break;
          case 'InvalidInviteCode':
            setSection(<InvalidGroupChatInvite />);
        }
      });
  }, [inviteCode]);
  return <>{section}</>;
}

function InvalidGroupChatInvite(): ReactElement {
  return (
    <Card size='small'>
      This group chat invite has become invalid because the chat it&apos;s for is no longer accepting invitations.
    </Card>
  );
}

interface GroupChatInvitationProps {
  readonly inviteCode: Uuid;
  readonly info: GroupChatInfo;
}

// TODO: Once Omni Chat Backend 0.23.0 releases, disable the join button if the user is already in the chat.
function GroupChatInvitation({ inviteCode, info }: GroupChatInvitationProps): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    const result = await joinGroupChat(inviteCode);
    if (result?.joinGroupChat === null) message.success("You've joined the group chat.", 5);
    else if (result?.joinGroupChat.__typename === 'InvalidInviteCode')
      message.error('The chat is no longer accepting invitations.', 5);
    setLoading(false);
  };
  return (
    <Card>
      {/* TODO: Once Omni ChatBackend 0.23.0 releases, pass the invited chat's ID to <Card.Meta>: avatar={<GroupChatPic chatId={chatId} />} */}
      <Card.Meta
        title={
          <Row justify='space-between'>
            <Col>{info.title}</Col>
            <Col>
              <GroupChatTags isBroadcast={info.isBroadcast} publicity={info.publicity} />
            </Col>
          </Row>
        }
        description={
          <Space direction='vertical'>
            <ReactMarkdown plugins={[gfm]}>{info.description}</ReactMarkdown>
            <Button type='primary' loading={isLoading} onClick={onClick}>
              Join
            </Button>
          </Space>
        }
      />
    </Card>
  );
}

interface ReadGroupChatResult {
  readonly readGroupChat: GroupChatInfo | InvalidInviteCode;
}

interface GroupChatInfo {
  readonly __typename: 'GroupChatInfo';
  readonly title: GroupChatTitle;
  readonly description: GroupChatDescription;
  readonly isBroadcast: boolean;
  readonly publicity: GroupChatPublicity;
}

type GroupChatPublicity = 'INVITABLE' | 'NOT_INVITABLE' | 'PUBLIC';

interface InvalidInviteCode {
  readonly __typename: 'InvalidInviteCode';
}

async function readGroupChat(inviteCode: Uuid): Promise<ReadGroupChatResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            query ReadGroupChat($inviteCode: Uuid!) {
              readGroupChat(inviteCode: $inviteCode) {
                __typename
                ... on GroupChatInfo {
                  title
                  description
                  isBroadcast
                  publicity
                }
              }
            }
          `,
          variables: { inviteCode },
        },
        Storage.readAccessToken()!,
      ),
  );
}

interface JoinGroupChatResult {
  readonly joinGroupChat: InvalidInviteCode | null;
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
