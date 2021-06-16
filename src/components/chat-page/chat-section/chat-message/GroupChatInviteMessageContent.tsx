import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { GroupChatDescription, GroupChatTitle, queryOrMutate, Uuid } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { Storage } from '../../../../Storage';
import { Card, Space, Spin, Tag } from 'antd';
import GroupChatPic from '../../GroupChatPic';

export interface GroupChatInviteMessageContentProps {
  readonly inviteCode: Uuid;
  readonly chatId: number;
}

export default function GroupChatInviteMessageContent({
  inviteCode,
  chatId,
}: GroupChatInviteMessageContentProps): ReactElement {
  const [section, setSection] = useState<ReactNode>(<Spin />);
  useEffect(() => {
    readGroupChat(inviteCode).then((response) => {
      switch (response?.readGroupChat.__typename) {
        case 'GroupChatInfo':
          setSection(<GroupChatInvitation chatId={chatId} info={response.readGroupChat} />);
          break;
        case 'InvalidInviteCode':
          setSection('The chat is no longer accepting invitations.');
          break;
        case undefined:
          setSection('A bug prevented the chat from getting fetched. Refresh the page to see it.');
      }
    });
  });
  return <>{section}</>;
}

interface GroupChatInvitationProps {
  readonly info: GroupChatInfo;
  readonly chatId: number;
}

// TODO: Style the card as much as antd allows for it, and add a "Join" button.
function GroupChatInvitation({ info, chatId }: GroupChatInvitationProps): ReactElement {
  return (
    <Card
      size='small'
      title={info.title}
      extra={<GroupChatTags isBroadcast={info.isBroadcast} publicity={info.publicity} />}
    >
      <Space>
        <GroupChatPic chatId={chatId} />
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

// TODO: If you use the following, abstract it into another file because it's copy-pasted from another file.

interface GroupChatTagsProps {
  readonly isBroadcast: boolean;
  readonly publicity: GroupChatPublicity;
}

function GroupChatTags({ isBroadcast, publicity }: GroupChatTagsProps): ReactElement {
  /*
  In order to keep it visually consistent, the "Broadcast" tag will appear left-most because it may be toggled
  relatively often, the "Public" tag will be to the left of the "Group" tag because it's relatively permanent compared
  to the "Broadcast" tag, and the "Group" tag will be on the right because it's permanent.
   */
  const tags = [];
  if (isBroadcast)
    tags.push(
      <Tag key='broadcast' color='cyan'>
        Broadcast
      </Tag>,
    );
  if (publicity === 'PUBLIC')
    tags.push(
      <Tag key='public' color='blue'>
        Public
      </Tag>,
    );
  tags.push(
    <Tag key='group' color='green'>
      Group
    </Tag>,
  );
  return <>{tags}</>;
}
