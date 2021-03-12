import React, {ReactElement, useContext} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ChatsSlice} from '../../store/slices/ChatsSlice';
import {Avatar, Card, Col, Menu, Row, Spin, Tag, Typography} from 'antd';
import {ActionMessage, Chat, GroupChat, PicMessage, PollMessage, PrivateChat, TextMessage} from '@neelkamath/omni-chat';
import {ChatPageLayoutContext} from '../../chatPageLayoutContext';
import ChatSection from './ChatSection';
import {RootState} from '../../store/store';
import {PicsSlice} from '../../store/slices/PicsSlice';
import {TeamOutlined, UserOutlined} from '@ant-design/icons';

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function MenuChats(): ReactElement {
  const chats = useSelector(ChatsSlice.selectChats);
  const isLoaded = useSelector(ChatsSlice.selectIsLoaded);
  const dispatch = useDispatch();
  dispatch(ChatsSlice.fetchChats());
  if (!isLoaded) return <Spin />;
  const items = chats.map(chat => {
    return (
      <Menu.Item key={chat.id}>
        <ChatCard chat={chat} />
      </Menu.Item>
    );
  });
  return <>{items}</>;
}

interface ChatCardProps {
  readonly chat: Chat;
}

// TODO: Ensure long messages and chat names don't overflow.
/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function ChatCard({chat}: ChatCardProps): ReactElement {
  const {setContent} = useContext(ChatPageLayoutContext)!;
  return (
    <Card hoverable={true} onClick={() => setContent(<ChatSection chatId={chat.id} />)}>
      <Row>
        <Col>
          <ChatPic chat={chat} />
        </Col>
        <Col>
          <ChatName chat={chat} />
          <ChatTags chat={chat} />
          <LastChatMessage chatId={chat.id} />
        </Col>
      </Row>
    </Card>
  );
}

interface ChatPicProps {
  readonly chat: Chat;
}

function ChatPic({chat}: ChatPicProps): ReactElement {
  switch (chat.__typename) {
    case 'PrivateChat':
      return <PrivateChatPic userId={(chat as PrivateChat).user.id} />;
    case 'GroupChat':
      return <GroupChatPic chatId={chat.id} />;
  }
}

interface ChatNameProps {
  readonly chat: Chat;
}

function ChatName({chat}: ChatNameProps): ReactElement {
  return (
    <Typography.Text strong>
      {chat.__typename === 'PrivateChat' ? (chat as PrivateChat).user.username : (chat as GroupChat).title}
    </Typography.Text>
  );
}

interface ChatTagsProps {
  readonly chat: Chat;
}

function ChatTags({chat}: ChatTagsProps): ReactElement {
  const tags = [];
  switch (chat.__typename) {
    case 'GroupChat':
      tags.push('Group');
      if ((chat as GroupChat).isBroadcast) tags.push('Broadcast');
      if ((chat as GroupChat).publicity === 'PUBLIC') tags.push('Public');
      break;
    case 'PrivateChat':
      tags.push('Private');
  }
  return (
    <>
      {tags.map(tag => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </>
  );
}

interface LastChatMessageProps {
  readonly chatId: number;
}

function LastChatMessage({chatId}: LastChatMessageProps): ReactElement {
  const lastMessage = useSelector((state: RootState) => ChatsSlice.selectLastMessage(state, chatId));
  const dispatch = useDispatch();
  dispatch(ChatsSlice.fetchChat(chatId));
  if (lastMessage === undefined) return <></>;
  let message;
  switch (lastMessage.__typename) {
    case 'TextMessage':
      message = (lastMessage as TextMessage).textMessage;
      break;
    case 'ActionMessage':
      message = (lastMessage as ActionMessage).actionableMessage.text;
      break;
    case 'PicMessage': {
      const caption = (lastMessage as PicMessage).caption;
      if (caption === null) message = <Typography.Text strong>Sent a picture.</Typography.Text>;
      else message = caption;
      break;
    }
    case 'PollMessage':
      message = (lastMessage as PollMessage).poll.title;
      break;
    case 'AudioMessage':
      message = <Typography.Text strong>Sent an audio.</Typography.Text>;
      break;
    case 'DocMessage':
      message = <Typography.Text strong>Sent a document.</Typography.Text>;
      break;
    case 'GroupChatInviteMessage':
      message = <Typography.Text strong>Sent a group chat invite.</Typography.Text>;
      break;
    case 'VideoMessage':
      message = <Typography.Text strong>Send a video.</Typography.Text>;
  }
  return (
    <Typography.Paragraph>
      {lastMessage.sender.username}: {message}
    </Typography.Paragraph>
  );
}

interface PrivateChatPicProps {
  readonly userId: number;
}

function PrivateChatPic({userId}: PrivateChatPicProps): ReactElement {
  /*
  A <NonexistentUserIdError> will occur when the user deletes their account.
  It's the responsibility of the parent element to handle this accordingly.
   */
  const url = useSelector((state: RootState) => PicsSlice.selectPic(state, 'PROFILE_PIC', userId));
  const dispatch = useDispatch();
  dispatch(PicsSlice.fetchPic({id: userId, type: 'PROFILE_PIC'}));
  return url === undefined ? (
    <Spin size="small" />
  ) : (
    <Avatar size="large" src={url === null ? <UserOutlined /> : url} />
  );
}

interface GroupChatPicProps {
  readonly chatId: number;
}

function GroupChatPic({chatId}: GroupChatPicProps): ReactElement {
  const pic = useSelector((state: RootState) => PicsSlice.selectPic(state, 'GROUP_CHAT_PIC', chatId));
  const dispatch = useDispatch();
  dispatch(PicsSlice.fetchPic({id: chatId, type: 'GROUP_CHAT_PIC'}));
  return pic === undefined ? (
    <Spin size="small" />
  ) : (
    <Avatar size="large" src={pic === null ? <TeamOutlined /> : pic} />
  );
}
