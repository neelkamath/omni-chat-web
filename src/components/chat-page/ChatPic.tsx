import React, { ReactElement } from 'react';
import GroupChatPic from './GroupChatPic';
import PrivateChatPic from './PrivateChatPic';

export interface ChatPicProps {
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

export default function ChatPic({ chat }: ChatPicProps): ReactElement {
  switch (chat.__typename) {
    case 'PrivateChat':
      return <PrivateChatPic userId={(chat as PrivateChat).user.userId} />;
    case 'GroupChat':
      return <GroupChatPic chatId={(chat as GroupChat).chatId} />;
  }
}
