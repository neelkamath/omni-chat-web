import React, { ReactElement, useEffect, useState } from 'react';
import { Spin } from 'antd';
import PrivateChatSection from './PrivateChatSection';
import GroupChatSection from './GroupChatSection';
import { Chat, GroupChat, PrivateChat } from '@neelkamath/omni-chat';
import { QueriesApiWrapper } from '../../api/QueriesApiWrapper';

export interface ChatSectionProps {
  readonly chatId: number;
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function ChatSection({ chatId }: ChatSectionProps): ReactElement {
  const [section, setSection] = useState(<Spin style={{ padding: 16 }} />);
  useEffect(() => {
    readChat(chatId).then((chat) => {
      switch (chat?.__typename) {
        case 'PrivateChat':
          setSection(<PrivateChatSection chat={chat as PrivateChat} />);
          break;
        case 'GroupChat':
          setSection(<GroupChatSection chat={chat as GroupChat} />);
      }
    });
  }, [chatId]);
  return section;
}

async function readChat(id: number): Promise<Chat | undefined> {
  const privateChatMessagesPagination = { last: 10 };
  const groupChatMessagesPagination = { last: 10 };
  const groupChatUsersPagination = { first: 0 };
  return await QueriesApiWrapper.readChat(
    id,
    privateChatMessagesPagination,
    groupChatUsersPagination,
    groupChatMessagesPagination,
  );
}
