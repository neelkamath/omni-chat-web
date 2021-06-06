import React, { ReactElement, useEffect, useState } from 'react';
import { Empty, message, Spin } from 'antd';
import PrivateChatSection from './private-chat-section/PrivateChatSection';
import GroupChatSection from './GroupChatSection';
import { useSelector } from 'react-redux';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { RootState, useThunkDispatch } from '../../../store/store';

export interface ChatSectionProps {
  readonly chatId: number;
}

export default function ChatSection({ chatId }: ChatSectionProps): ReactElement {
  const [section, setSection] = useState(<Spin style={{ padding: 16 }} />);
  useThunkDispatch(ChatsSlice.fetchChats());
  const isDeletedPrivateChat = useSelector((state: RootState) => ChatsSlice.selectIsDeletedPrivateChat(state, chatId));
  const chat = useSelector((state: RootState) => ChatsSlice.selectChat(state, chatId));
  const onDeletedChat = () => {
    message.warning('This chat has just been deleted.', 5);
    setSection(<Empty />);
  };
  useEffect(() => {
    if (isDeletedPrivateChat) onDeletedChat();
  }, [isDeletedPrivateChat]);
  useEffect(() => {
    switch (chat?.__typename) {
      case 'PrivateChat':
        setSection(<PrivateChatSection chat={chat as ChatsSlice.PrivateChat} />);
        break;
      case 'GroupChat':
        setSection(<GroupChatSection chat={chat as ChatsSlice.GroupChat} />);
        break;
      case undefined:
        onDeletedChat();
    }
  }, [chat]);
  return section;
}
