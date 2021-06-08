import React, { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { Card, Col, Row, Spin } from 'antd';
import { useThunkDispatch } from '../../../store/store';
import ChatPic from '../ChatPic';
import ChatMetadata from './ChatMetadata';
import { ChatPageLayoutSlice } from '../../../store/slices/ChatPageLayoutSlice';

export default function MenuChats(): ReactElement {
  const chats = useSelector(ChatsSlice.selectChats);
  const isLoading = !useSelector(ChatsSlice.selectIsLoaded);
  useThunkDispatch(ChatsSlice.fetchChats());
  if (isLoading) return <Spin style={{ padding: 16 }} />;
  const cards = chats.map((chat) => <ChatCard key={chat.chatId} chat={chat} />);
  return <>{cards}</>;
}

interface ChatCardProps {
  readonly chat: ChatsSlice.Chat;
}

function ChatCard({ chat }: ChatCardProps): ReactElement {
  const dispatch = useDispatch();
  return (
    <Card
      size='small'
      hoverable={true}
      onClick={() => dispatch(ChatPageLayoutSlice.update({ type: 'CHAT_SECTION', chatId: chat.chatId }))}
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
