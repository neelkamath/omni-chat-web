import React, { ReactElement, useEffect, useState } from 'react';
import { Divider, Empty, Layout, message, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { RootState } from '../../../store/store';
import Header from './Header';
import MessageCreator from './message-creator/MessageCreator';
import ChatMessage from './chat-message/ChatMessage';
import { Storage } from '../../../Storage';

export interface ChatSectionProps {
  readonly chatId: number;
}

export default function ChatSection({ chatId }: ChatSectionProps): ReactElement {
  const [section, setSection] = useState(<Spin style={{ padding: 16 }} />);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChat(chatId));
  }, [dispatch, chatId]);
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
    if (chat?.__typename === 'PrivateChat') setSection(<ChatSegment chat={chat} />);
    else if (chat?.__typename === 'GroupChat') setSection(<ChatSegment chat={chat} />);
  }, [chat]);
  return section;
}

interface ChatSegmentProps {
  readonly chat: ChatsSlice.Chat;
}

function ChatSegment({ chat }: ChatSegmentProps): ReactElement {
  return (
    <Layout>
      <Layout.Header>
        <Header chat={chat} />
      </Layout.Header>
      <Layout.Content style={{ padding: 16 }}>
        {chat.messages.edges.map(({ node }) => (
          <ChatMessage chatId={chat.chatId} key={node.messageId} message={node} />
        ))}
        {chat.messages.edges.length > 0 && <Divider />}
        <MessageCreatorSection chat={chat} />
      </Layout.Content>
    </Layout>
  );
}

interface MessageCreatorSectionProps {
  readonly chat: ChatsSlice.Chat;
}

function MessageCreatorSection({ chat }: MessageCreatorSectionProps): ReactElement {
  switch (chat.__typename) {
    case 'PrivateChat':
      return <MessageCreator key={chat.chatId} chatId={chat.chatId} />;
    case 'GroupChat': {
      const isParticipant =
        (chat as ChatsSlice.GroupChat).users.edges.find(({ node }) => node.userId === Storage.readUserId()) !==
        undefined;
      const isAdmin = (chat as ChatsSlice.GroupChat).adminIdList.includes(Storage.readUserId()!);
      if (!isParticipant) return <>You must be a participant to send messages.</>;
      else if ((chat as ChatsSlice.GroupChat).isBroadcast && !isAdmin) return <>Only admins can send messages.</>;
      else return <MessageCreator key={chat.chatId} chatId={chat.chatId} />;
    }
  }
}
