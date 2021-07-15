import React, { ReactElement } from 'react';
import GroupChatImage from './GroupChatImage';
import PrivateChatImage from './PrivateChatImage';

export interface ChatImageProps {
  readonly chat: Chat;
}

export interface Chat {
  readonly __typename: 'PrivateChat' | 'GroupChat';
}

export interface GroupChat extends Chat {
  readonly __typename: 'GroupChat';
  readonly chatId: number;
}

export interface PrivateChat extends Chat {
  readonly __typename: 'PrivateChat';
  readonly user: Account;
}

export interface Account {
  readonly userId: number;
}

export default function ChatImage({ chat }: ChatImageProps): ReactElement {
  switch (chat.__typename) {
    case 'PrivateChat':
      return <PrivateChatImage userId={(chat as PrivateChat).user.userId} />;
    case 'GroupChat':
      return <GroupChatImage chatId={(chat as GroupChat).chatId} />;
  }
}
