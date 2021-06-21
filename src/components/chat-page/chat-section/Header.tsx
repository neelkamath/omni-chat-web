import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import React, { MouseEventHandler, ReactElement, ReactNode, useEffect, useState } from 'react';
import { Button, Col, Row, Tag, Typography } from 'antd';
import ChatPic from '../ChatPic';
import { InfoCircleOutlined } from '@ant-design/icons';
import ProfileModal from '../ProfileModal';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { OnlineStatusesSlice } from '../../../store/slices/OnlineStatusesSlice';
import TimeAgo from 'timeago-react';
import { TypingStatusesSlice } from '../../../store/slices/TypingStatusesSlice';
import { ChatPageLayoutSlice } from '../../../store/slices/ChatPageLayoutSlice';
import GroupChatTags from './GroupChatTags';
import { AccountsSlice } from '../../../store/slices/AccountsSlice';
import PrivateChatName from '../PrivateChatName';

export interface HeaderProps {
  readonly chat: ChatsSlice.Chat;
}

export default function Header({ chat }: HeaderProps): ReactElement {
  const dispatch = useDispatch();
  const [isVisible, setVisible] = useState(false);
  let name: ReactNode, typingStatusSection: ReactElement, tags: ReactElement, onClick: MouseEventHandler<HTMLElement>;
  switch (chat.__typename) {
    case 'PrivateChat':
      name = <PrivateChatName userId={(chat as ChatsSlice.PrivateChat).user.userId} />;
      typingStatusSection = (
        <PrivateChatTypingStatusSection userId={(chat as ChatsSlice.PrivateChat).user.userId} chatId={chat.chatId} />
      );
      tags = <Tag color='orange'>Private</Tag>;
      onClick = () => setVisible(true);
      break;
    case 'GroupChat':
      name = (chat as ChatsSlice.GroupChat).title;
      typingStatusSection = <GroupChatTypingStatusSection chatId={chat.chatId} />;
      tags = (
        <GroupChatTags
          isBroadcast={(chat as ChatsSlice.GroupChat).isBroadcast}
          publicity={(chat as ChatsSlice.GroupChat).publicity}
        />
      );
      onClick = () => dispatch(ChatPageLayoutSlice.update({ type: 'GROUP_CHAT_INFO', chatId: chat.chatId }));
  }
  return (
    <Row gutter={16}>
      <Col>
        <ChatPic chat={chat} />
      </Col>
      <Col>
        <Typography.Text style={{ color: 'white' }} strong>
          {name}
        </Typography.Text>
      </Col>
      {chat.__typename === 'PrivateChat' && (
        <OnlineStatusSection userId={(chat as ChatsSlice.PrivateChat).user.userId} />
      )}
      {typingStatusSection}
      <Col>
        {tags}
        <Button ghost onClick={onClick} icon={<InfoCircleOutlined />} />
        {chat.__typename === 'PrivateChat' && (
          <ProfileModal
            userId={(chat as ChatsSlice.PrivateChat).user.userId}
            hasChatButton={false}
            isVisible={isVisible}
            onCancel={() => setVisible(false)}
          />
        )}
      </Col>
    </Row>
  );
}

interface OnlineStatusSectionProps {
  readonly userId: number;
}

function OnlineStatusSection({ userId }: OnlineStatusSectionProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(OnlineStatusesSlice.fetchStatus(userId));
  }, [dispatch, userId]);
  const onlineStatus = useSelector((state: RootState) => OnlineStatusesSlice.select(state, userId));
  if (onlineStatus === undefined) return <></>;
  let status: ReactNode;
  if (onlineStatus.isOnline) status = 'online';
  else if (onlineStatus.lastOnline === null) status = 'offline';
  else
    status = (
      <>
        last online <TimeAgo datetime={onlineStatus.lastOnline} opts={{ minInterval: 60 }} />
      </>
    );
  return (
    <Col>
      <Typography.Text style={{ color: 'white' }}>{status}</Typography.Text>
    </Col>
  );
}

interface PrivateChatTypingStatusSectionProps {
  readonly userId: number;
  readonly chatId: number;
}

function PrivateChatTypingStatusSection({ userId, chatId }: PrivateChatTypingStatusSectionProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(TypingStatusesSlice.fetchStatuses());
  }, [dispatch]);
  const isTyping = useSelector((state: RootState) => TypingStatusesSlice.selectIsTyping(state, userId, chatId));
  return <Col flex='auto'>{isTyping ? 'typing...' : ''}</Col>;
}

interface GroupChatTypingStatusSectionProps {
  readonly chatId: number;
}

function GroupChatTypingStatusSection({ chatId }: GroupChatTypingStatusSectionProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(TypingStatusesSlice.fetchStatuses());
  }, [dispatch]);
  const userIdList = useSelector((state: RootState) => TypingStatusesSlice.selectTyping(state, chatId));
  const userId = userIdList[userIdList.length - 1];
  useEffect(() => {
    if (userId !== undefined) dispatch(AccountsSlice.fetch(userId));
  }, [userId, dispatch]);
  const username = useSelector((state: RootState) => AccountsSlice.select(state, userId))?.username;
  return <Col flex='auto'>{username === undefined ? '' : `${username} is typing`}</Col>;
}
