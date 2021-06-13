import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import React, { MouseEventHandler, ReactElement, ReactNode, useState } from 'react';
import { Button, Col, Row, Tag, Typography } from 'antd';
import ChatPic from '../ChatPic';
import { InfoCircleOutlined } from '@ant-design/icons';
import ProfileModal from '../ProfileModal';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../../store/store';
import { OnlineStatusesSlice } from '../../../store/slices/OnlineStatusesSlice';
import TimeAgo from 'timeago-react';
import { TypingStatusesSlice } from '../../../store/slices/TypingStatusesSlice';
import { ChatPageLayoutSlice } from '../../../store/slices/ChatPageLayoutSlice';

export interface HeaderProps {
  readonly chat: ChatsSlice.PrivateChat | ChatsSlice.GroupChat;
}

export default function Header({ chat }: HeaderProps): ReactElement {
  const dispatch = useDispatch();
  const [isVisible, setVisible] = useState(false);
  let name: string, typingStatusSection: ReactElement, tags: ReactElement, onClick: MouseEventHandler<HTMLElement>;
  switch (chat.__typename) {
    case 'PrivateChat':
      name = chat.user.username;
      typingStatusSection = <PrivateChatTypingStatusSection userId={chat.user.userId} chatId={chat.chatId} />;
      tags = <Tag color='orange'>Private</Tag>;
      onClick = () => setVisible(true);
      break;
    case 'GroupChat':
      name = chat.title;
      typingStatusSection = <GroupChatTypingStatusSection chatId={chat.chatId} />;
      tags = <GroupChatTags chat={chat} />;
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
      {chat.__typename === 'PrivateChat' && <OnlineStatusSection userId={chat.user.userId} />}
      {typingStatusSection}
      <Col>
        {tags}
        <Button ghost onClick={onClick} icon={<InfoCircleOutlined />} />
        {chat.__typename === 'PrivateChat' && (
          <ProfileModal
            account={chat.user}
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
  const onlineStatus = useSelector((state: RootState) => OnlineStatusesSlice.select(state, userId));
  useThunkDispatch(OnlineStatusesSlice.fetchStatus(userId));
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
  useThunkDispatch(TypingStatusesSlice.fetchStatuses());
  const isTyping = useSelector((state: RootState) => TypingStatusesSlice.selectIsTyping(state, userId, chatId));
  return <Col flex='auto'>{isTyping ? 'typing...' : ''}</Col>;
}

interface GroupChatTypingStatusSectionProps {
  readonly chatId: number;
}

function GroupChatTypingStatusSection({ chatId }: GroupChatTypingStatusSectionProps): ReactElement {
  useThunkDispatch(TypingStatusesSlice.fetchStatuses());
  const userIdList = useSelector((state: RootState) => TypingStatusesSlice.selectTyping(state, chatId));
  // TODO: Instead of displaying the user ID, display the username. This can be done once AccountsSlice is implemented.
  return <Col flex='auto'>{userIdList.length === 0 ? `${userIdList[userIdList.length - 1]} is typing` : ''}</Col>;
}

interface GroupChatTagsProps {
  readonly chat: ChatsSlice.GroupChat;
}

function GroupChatTags({ chat }: GroupChatTagsProps): ReactElement {
  /*
  In order to keep it visually consistent, the "Broadcast" tag will appear left-most because it may be toggled
  relatively often, the "Public" tag will be to the left of the "Group" tag because it's relatively permanent compared
  to the "Broadcast" tag, and the "Group" tag will be on the right because it's permanent.
   */
  const tags = [];
  if (chat.isBroadcast)
    tags.push(
      <Tag key='broadcast' color='cyan'>
        Broadcast
      </Tag>,
    );
  if (chat.publicity === 'PUBLIC')
    tags.push(
      <Tag key='public' color='blue'>
        Public
      </Tag>,
    );
  tags.push(
    <Tag key='group' color='green'>
      Group
    </Tag>,
  );
  return <>{tags}</>;
}
