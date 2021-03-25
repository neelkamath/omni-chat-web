import React, { ReactElement, useEffect, useState } from 'react';
import { Empty, message, Spin } from 'antd';
import PrivateChatSection from './PrivateChatSection';
import GroupChatSection from './GroupChatSection';
import { Chat, GroupChat, PrivateChat, readChat } from '@neelkamath/omni-chat';
import { Storage } from '../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../api';

export interface ChatSectionProps {
  readonly chatId: number;
}

export default function ChatSection({ chatId }: ChatSectionProps): ReactElement {
  const [section, setSection] = useState(<Spin style={{ padding: 16 }} />);
  useEffect(() => {
    operateReadChat(chatId).then((chat) => {
      switch (chat?.__typename) {
        case 'PrivateChat':
          setSection(<PrivateChatSection chat={chat as PrivateChat} />);
          break;
        case 'GroupChat':
          setSection(<GroupChatSection chat={chat as GroupChat} />);
          break;
        case undefined:
          message.warning('This chat has just been deleted.', 5);
          setSection(<Empty />);
      }
    });
  }, [chatId]);
  return section;
}

async function operateReadChat(id: number): Promise<Chat | undefined> {
  const privateChatMessagesPagination = { last: 10 };
  const groupChatMessagesPagination = { last: 10 };
  const groupChatUsersPagination = { first: 0 };
  const result = await operateGraphQlApi(() =>
    readChat(
      httpApiConfig,
      Storage.readAccessToken()!,
      id,
      privateChatMessagesPagination,
      groupChatUsersPagination,
      groupChatMessagesPagination,
    ),
  );
  return result?.readChat.__typename === 'InvalidChatId' ? undefined : result?.readChat;
}
