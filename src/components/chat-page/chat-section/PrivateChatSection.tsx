import React, { ReactElement, useState } from 'react';
import { Button, Col, Layout, Row, Tag, Typography } from 'antd';
import { InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import ProfileModal from '../ProfileModal';
import ChatMessage from './ChatMessage';
import { Account, PrivateChat } from '@neelkamath/omni-chat';
import { useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../../store/store';
import { OnlineStatusesSlice } from '../../../store/slices/OnlineStatusesSlice';
import { TypingStatusesSlice } from '../../../store/slices/TypingStatusesSlice';
import { PicsSlice } from '../../../store/slices/PicsSlice';
import CustomAvatar from '../CustomAvatar';
import TimeAgo from 'timeago-react';

export interface PrivateChatSectionProps {
  readonly chat: PrivateChat;
}

// TODO: Create and read messages.
export default function PrivateChatSection({ chat }: PrivateChatSectionProps): ReactElement {
  return (
    <Layout>
      <Layout.Header>
        <Header user={chat.user} chatId={chat.id} />
      </Layout.Header>
      <Layout.Content>
        {chat.messages.edges.map(({ node }) => (
          <ChatMessage key={node.messageId} message={node} />
        ))}
      </Layout.Content>
    </Layout>
  );
}

interface HeaderProps {
  /** The user being chatted with. */
  readonly user: Account;
  readonly chatId: number;
}

function Header({ user, chatId }: HeaderProps): ReactElement {
  const [isVisible, setVisible] = useState(false);
  const onCancel = () => setVisible(false);
  return (
    <Row gutter={16}>
      <Col>
        <ProfilePic userId={user.id} />
      </Col>
      <Col>
        <Typography.Text style={{ color: 'white' }} strong>
          {user.username}
        </Typography.Text>
      </Col>
      <OnlineStatusSection userId={user.id} />
      <TypingStatusSection userId={user.id} chatId={chatId} />
      <Col>
        <Tag color='orange'>Private</Tag>
        <Button ghost onClick={() => setVisible(true)} icon={<InfoCircleOutlined />} />
        <ProfileModal account={user} hasChatButton={false} isVisible={isVisible} onCancel={onCancel} />
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
  let status;
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

interface TypingStatusSectionProps {
  readonly userId: number;
  readonly chatId: number;
}

function TypingStatusSection({ userId, chatId }: TypingStatusSectionProps): ReactElement {
  useThunkDispatch(TypingStatusesSlice.fetchStatuses());
  const isTyping = useSelector((state: RootState) => TypingStatusesSlice.selectIsTyping(state, userId, chatId));
  return <Col flex='auto'>{isTyping ? '·typing...' : ''}</Col>;
}

interface ProfilePicProps {
  readonly userId: number;
}

function ProfilePic({ userId }: ProfilePicProps): ReactElement {
  const url = useSelector((state: RootState) => PicsSlice.selectPic(state, 'PROFILE_PIC', userId, 'THUMBNAIL'));
  // A <NonexistentUserIdError> can occur but the parent element must handle the other user deleting their account.
  useThunkDispatch(PicsSlice.fetchPic({ id: userId, type: 'PROFILE_PIC' }));
  return <CustomAvatar icon={<UserOutlined />} url={url} />;
}
