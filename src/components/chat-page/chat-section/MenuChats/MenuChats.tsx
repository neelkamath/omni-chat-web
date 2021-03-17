import React, { ReactElement, useContext } from 'react';
import { useSelector } from 'react-redux';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import { Card, Col, Row, Spin } from 'antd';
import { Chat } from '@neelkamath/omni-chat';
import { ChatPageLayoutContext } from '../../../../chatPageLayoutContext';
import ChatSection from '../ChatSection';
import { useThunkDispatch } from '../../../../store/store';
import ChatPic from './ChatPic';
import LastChatMessage from './LastChatMessage';

// TODO: Test every LOC in this file once group chats can be created.

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function MenuChats(): ReactElement {
  const chats = useSelector(ChatsSlice.selectChats);
  const isLoading = !useSelector(ChatsSlice.selectIsLoaded);
  useThunkDispatch(ChatsSlice.fetchChats());
  if (isLoading) return <Spin style={{ padding: 16 }} />;
  const cards = chats.map((chat) => <ChatCard key={chat.id} chat={chat} />);
  return <>{cards}</>;
}

interface ChatCardProps {
  readonly chat: Chat;
}

// TODO: Make chats with new messages stand out, perhaps with a card glow.
/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function ChatCard({ chat }: ChatCardProps): ReactElement {
  const { setContent } = useContext(ChatPageLayoutContext)!;
  return (
    <Card size='small' hoverable={true} onClick={() => setContent(<ChatSection chatId={chat.id} />)}>
      <Row gutter={16}>
        <Col>
          <ChatPic chat={chat} />
        </Col>
        <Col>
          <LastChatMessage chat={chat} />
        </Col>
      </Row>
    </Card>
  );
}

