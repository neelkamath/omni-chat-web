import React, { ReactElement, useEffect, useState } from 'react';
import { GroupChatDescription, GroupChatPublicity, GroupChatTitle, queryOrMutate, Uuid } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { Storage } from '../../../../Storage';
import GroupChatInvitation from '../../GroupChatInvitation';
import { Card, Spin } from 'antd';

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
            setSection(
              <GroupChatInvitation
                invitedChatId={response.readGroupChat.chatId}
                data={inviteCode}
                {...response.readGroupChat}
              />,
            );
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

interface ReadGroupChatResult {
  readonly readGroupChat: GroupChatInfo | InvalidInviteCode;
}

interface GroupChatInfo {
  readonly __typename: 'GroupChatInfo';
  readonly chatId: number;
  readonly title: GroupChatTitle;
  readonly description: GroupChatDescription;
  readonly isBroadcast: boolean;
  readonly publicity: GroupChatPublicity;
}

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
                  chatId
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
