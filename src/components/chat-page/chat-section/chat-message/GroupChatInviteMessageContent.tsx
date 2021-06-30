import React, { ReactElement, useEffect, useState } from 'react';
import { GroupChatDescription, GroupChatTitle, queryOrMutate, Uuid } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { Storage } from '../../../../Storage';
import { Card, Space, Spin } from 'antd';
import GroupChatTags from '../GroupChatTags';

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
            setSection(<GroupChatInvitation info={response.readGroupChat} />);
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
  readonly info: GroupChatInfo;
}

// TODO: Style the card as much as antd allows for it, and add a "Join" button.
function GroupChatInvitation({ info }: GroupChatInvitationProps): ReactElement {
  return (
    <Card
      size='small'
      title={info.title}
      extra={<GroupChatTags isBroadcast={info.isBroadcast} publicity={info.publicity} />}
    >
      <Space>
        {/* TODO: Once Omni ChatBackend 0.23.0 releases, pass the invited chat's ID: <GroupChatPic chatId={chatId} /> */}
        {info.description}
      </Space>
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
