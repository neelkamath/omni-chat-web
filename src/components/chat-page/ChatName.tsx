import { ChatsSlice } from '../../store/slices/ChatsSlice';
import React, { ReactElement, ReactNode } from 'react';
import { Typography } from 'antd';
import PrivateChatName from './PrivateChatName';

export interface ChatNameProps {
  /**
   * Instead of passing a {@link ChatsSlice.PrivateChat}, you can pass a `number` which is the ID of the other user in
   * the private chat.
   */
  readonly data: ChatsSlice.Chat | number;
}

export default function ChatName({ data }: ChatNameProps): ReactElement {
  let name: ReactNode;
  if (typeof data === 'number') name = <PrivateChatName userId={data} />;
  else
    switch (data.__typename) {
      case 'GroupChat':
        name = (data as ChatsSlice.GroupChat).title;
        break;
      case 'PrivateChat':
        name = <PrivateChatName userId={(data as ChatsSlice.PrivateChat).user.userId} />;
    }
  return (
    <Typography.Text ellipsis strong style={{ width: 200 }}>
      {name}
    </Typography.Text>
  );
}
