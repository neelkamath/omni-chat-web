import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../store/store';
import { PicsSlice } from '../../store/slices/PicsSlice';
import CustomPic from './CustomPic';
import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import { ChatsSlice } from '../../store/slices/ChatsSlice';

export interface ChatPicProps {
  readonly chat: ChatsSlice.Chat;
}

/** {@link CustomPic} wrapper for chats. */
export default function ChatPic({ chat }: ChatPicProps): ReactElement {
  switch (chat.__typename) {
    case 'PrivateChat':
      return <PrivateChatPic userId={(chat as ChatsSlice.PrivateChat).user.userId} />;
    case 'GroupChat':
      return <GroupChatPic chatId={chat.chatId} />;
  }
}

interface PrivateChatPicProps {
  readonly userId: number;
}

function PrivateChatPic({ userId }: PrivateChatPicProps): ReactElement {
  /*
  A <NonexistentUserIdError> will occur when the user deletes their account. It's the responsibility of the parent
  element to handle this accordingly.
   */
  const url = useSelector((state: RootState) => PicsSlice.selectPic(state, 'PROFILE_PIC', userId, 'THUMBNAIL'));
  useThunkDispatch(PicsSlice.fetchPic({ id: userId, type: 'PROFILE_PIC' }));
  return <CustomPic icon={<UserOutlined />} url={url} />;
}

interface GroupChatPicProps {
  readonly chatId: number;
}

function GroupChatPic({ chatId }: GroupChatPicProps): ReactElement {
  /*
  A <NonexistentChatError> will occur when the chat has been deleted. It's the responsibility of the parent element to
  handle this accordingly.
   */
  const url = useSelector((state: RootState) => PicsSlice.selectPic(state, 'GROUP_CHAT_PIC', chatId, 'THUMBNAIL'));
  useThunkDispatch(PicsSlice.fetchPic({ id: chatId, type: 'GROUP_CHAT_PIC' }));
  return <CustomPic icon={<TeamOutlined />} url={url} />;
}
