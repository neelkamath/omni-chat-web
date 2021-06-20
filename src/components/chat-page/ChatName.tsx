import { ChatsSlice } from '../../store/slices/ChatsSlice';
import React, { ReactElement, ReactNode } from 'react';
import { Typography } from 'antd';
import PrivateChatName from './PrivateChatName';

export interface ChatNameProps {
  readonly chat: ChatsSlice.Chat;
}

export default function ChatName({ chat }: ChatNameProps): ReactElement {
  let name: ReactNode;
  switch (chat.__typename) {
    case 'GroupChat':
      name = (chat as ChatsSlice.GroupChat).title;
      break;
    case 'PrivateChat':
      name = <PrivateChatName chat={chat as ChatsSlice.PrivateChat} />;
  }
  return (
    <Typography.Text ellipsis strong style={{ width: 200 }}>
      {name}
    </Typography.Text>
  );
}
