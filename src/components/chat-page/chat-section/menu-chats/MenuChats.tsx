import React, { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import { Card, Col, Row, Spin } from 'antd';
import { Chat } from '@neelkamath/omni-chat';
import { useThunkDispatch } from '../../../../store/store';
import ChatPic from './ChatPic';
import ChatMetadata from './ChatMetadata';
import { ChatPageLayoutSlice } from '../../../../store/slices/ChatPageLayoutSlice';

// TODO: Test every LOC in this file once group chats can be created.

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
function ChatCard({ chat }: ChatCardProps): ReactElement {
  const dispatch = useDispatch();
  return (
    <Card
      size='small'
      hoverable={true}
      onClick={() => dispatch(ChatPageLayoutSlice.update({ type: 'CHAT_SECTION', chatId: chat.id }))}
    >
      <Row gutter={16}>
        <Col>
          <ChatPic chat={chat} />
        </Col>
        <Col>
          <ChatMetadata chat={chat} />
        </Col>
      </Row>
    </Card>
  );
}
