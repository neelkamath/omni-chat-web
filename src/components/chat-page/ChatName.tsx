import { ChatsSlice } from '../../store/slices/ChatsSlice';
import React, { ReactElement } from 'react';
import { Typography } from 'antd';

export interface ChatNameProps {
  readonly chat: ChatsSlice.Chat;
}

export default function ChatName({ chat }: ChatNameProps): ReactElement {
  let name: string;
  switch (chat.__typename) {
    case 'GroupChat':
      name = (chat as ChatsSlice.GroupChat).title;
      break;
    case 'PrivateChat':
      name = (chat as ChatsSlice.PrivateChat).user.username;
  }
  return (
    <Typography.Text ellipsis strong style={{ width: 200 }}>
      {name}
    </Typography.Text>
  );
}
