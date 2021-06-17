import React, { ReactElement } from 'react';
import { Tag } from 'antd';

export interface GroupChatTagsProps {
  readonly isBroadcast: boolean;
  readonly publicity: GroupChatPublicity;
}

export type GroupChatPublicity = 'INVITABLE' | 'NOT_INVITABLE' | 'PUBLIC';

export default function GroupChatTags({ isBroadcast, publicity }: GroupChatTagsProps): ReactElement {
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
