import React, { ReactElement, ReactNode, useState } from 'react';
import { Button, Col, Row, Tag, Typography } from 'antd';
import { InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import ProfileModal from '../../ProfileModal';
import { useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../../../store/store';
import { PicsSlice } from '../../../../store/slices/PicsSlice';
import CustomAvatar from '../../CustomAvatar';
import { OnlineStatusesSlice } from '../../../../store/slices/OnlineStatusesSlice';
import TimeAgo from 'timeago-react';
import { TypingStatusesSlice } from '../../../../store/slices/TypingStatusesSlice';
import { Account } from '../ChatSection';

export interface HeaderProps {
  /** The user being chatted with. */
  readonly user: Account;
  readonly chatId: number;
}

export default function Header({ user, chatId }: HeaderProps): ReactElement {
  const [isVisible, setVisible] = useState(false);
  const onCancel = () => setVisible(false);
  return (
    <Row gutter={16}>
      <Col>
        <ProfilePic userId={user.userId} />
      </Col>
      <Col>
        <Typography.Text style={{ color: 'white' }} strong>
          {user.username}
        </Typography.Text>
      </Col>
      <OnlineStatusSection userId={user.userId} />
      <TypingStatusSection userId={user.userId} chatId={chatId} />
      <Col>
        <Tag color='orange'>Private</Tag>
        <Button ghost onClick={() => setVisible(true)} icon={<InfoCircleOutlined />} />
        <ProfileModal account={user} hasChatButton={false} isVisible={isVisible} onCancel={onCancel} />
      </Col>
    </Row>
  );
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

interface TypingStatusSectionProps {
  readonly userId: number;
  readonly chatId: number;
}

function TypingStatusSection({ userId, chatId }: TypingStatusSectionProps): ReactElement {
  useThunkDispatch(TypingStatusesSlice.fetchStatuses());
  const isTyping = useSelector((state: RootState) => TypingStatusesSlice.selectIsTyping(state, userId, chatId));
  return <Col flex='auto'>{isTyping ? '·typing...' : ''}</Col>;
}
