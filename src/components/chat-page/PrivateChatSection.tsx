import React, {ReactElement, useContext, useState} from 'react';
import {Avatar, Button, Col, Empty, Layout, message, Row, Spin, Typography} from 'antd';
import {InfoCircleOutlined, UserOutlined} from '@ant-design/icons';
import ProfileModal from './ProfileModal';
import {ChatPageLayoutContext} from '../../chatPageLayoutContext';
import ChatMessage from './ChatMessage';
import {Account, NonexistentUserIdError, PrivateChat} from '@neelkamath/omni-chat';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../store/store';
import {OnlineStatusesSlice} from '../../store/slices/OnlineStatusesSlice';
import {TypingStatusesSlice} from '../../store/slices/TypingStatusesSlice';
import {PicsSlice} from '../../store/slices/PicsSlice';

export interface PrivateChatSectionProps {
  readonly chat: PrivateChat;
}

// TODO: Create and read messages.
/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function PrivateChatSection({chat}: PrivateChatSectionProps): ReactElement {
  return (
    <Layout>
      <Layout.Header>
        <Header user={chat.user} chatId={chat.id} />
      </Layout.Header>
      <Layout.Content>
        {chat.messages.edges.map(({node}) => (
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

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function Header({user, chatId}: HeaderProps): ReactElement {
  const [isVisible, setVisible] = useState(false);
  const onCancel = () => setVisible(false);
  return (
    <Row gutter={16}>
      <Col>
        <ProfilePic userId={user.id} />
      </Col>
      <Col>
        <Typography.Text style={{color: 'white'}} strong>
          {user.username}
        </Typography.Text>
      </Col>
      <OnlineStatusSection userId={user.id} />
      <TypingStatusSection userId={user.id} chatId={chatId} />
      <Col>
        <Button ghost onClick={() => setVisible(true)} icon={<InfoCircleOutlined />} />
        <ProfileModal account={user} hasChatButton={false} isVisible={isVisible} onCancel={onCancel} />
      </Col>
    </Row>
  );
}

interface OnlineStatusSectionProps {
  readonly userId: number;
}

function OnlineStatusSection({userId}: OnlineStatusSectionProps): ReactElement {
  const onlineStatus = useSelector((state: RootState) => OnlineStatusesSlice.select(state, userId));
  const dispatch = useDispatch();
  dispatch(OnlineStatusesSlice.fetchStatuses());
  const wrap = (element: ReactElement) => <Col>{element}</Col>;
  if (onlineStatus === undefined) return wrap(<Spin size="small" />);
  let status;
  if (onlineStatus.isOnline) status = 'online';
  else if (onlineStatus.lastOnline === null) status = 'offline';
  else {
    const lastOnline = new Date(onlineStatus.lastOnline).toLocaleString();
    status = `last online ${lastOnline}`;
  }
  return wrap(<Typography.Text style={{color: 'white'}}>{status}</Typography.Text>);
}

interface TypingStatusSectionProps {
  readonly userId: number;
  readonly chatId: number;
}

function TypingStatusSection({userId, chatId}: TypingStatusSectionProps): ReactElement {
  const dispatch = useDispatch();
  dispatch(TypingStatusesSlice.fetchStatuses());
  const isTyping = useSelector((state: RootState) => TypingStatusesSlice.selectIsTyping(state, userId, chatId));
  return <Col flex="auto">{isTyping ? '·typing...' : ''}</Col>;
}

interface ProfilePicProps {
  readonly userId: number;
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function ProfilePic({userId}: ProfilePicProps): ReactElement {
  const {setContent} = useContext(ChatPageLayoutContext)!;
  const dispatch = useDispatch();
  const pic = useSelector((state: RootState) => PicsSlice.selectPic(state, 'PROFILE_PIC', userId, 'THUMBNAIL'));
  const error = useSelector((state: RootState) => PicsSlice.selectError(state, 'PROFILE_PIC', userId));
  dispatch(PicsSlice.fetchPic({id: userId, type: 'PROFILE_PIC'}));
  if (error instanceof NonexistentUserIdError)
    message.warning('That user just deleted their account.').then(() => setContent(<Empty style={{padding: 16}} />));
  if (pic === undefined || pic === null) return <UserOutlined />;
  return <Avatar size="large" src={pic} />;
}
