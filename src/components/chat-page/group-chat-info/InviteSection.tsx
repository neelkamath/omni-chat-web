import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { Button, Card, Divider, message, Modal, Popconfirm, Space, Spin } from 'antd';
import { ShareAltOutlined } from '@ant-design/icons';
import ChatPic from '../ChatPic';
import ChatName from '../ChatName';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import { Storage } from '../../../Storage';
import { ContactsSlice } from '../../../store/slices/ContactsSlice';
import PrivateChatPic from '../PrivateChatPic';
import operateCreatePrivateChat from '../../../operateCreatePrivateChat';

export interface InviteSectionProps {
  readonly chatId: number;
}

export default function InviteSection({ chatId }: InviteSectionProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChat(chatId));
  }, [dispatch, chatId]);
  const publicity = useSelector((state: RootState) => ChatsSlice.selectPublicity(state, chatId));
  const participants = useSelector((state: RootState) => ChatsSlice.selectParticipants(state, chatId));
  const [isVisible, setVisible] = useState(false);
  if (publicity === undefined || participants === undefined) return <Spin />;
  if (!participants.includes(Storage.readUserId()!) || publicity === 'NOT_INVITABLE') return <></>;
  return (
    <>
      <Divider />
      <Button icon={<ShareAltOutlined />} onClick={() => setVisible(true)}>
        Invite
      </Button>
      <Modal visible={isVisible} onCancel={() => setVisible(false)} footer={null}>
        <Chats invitedChatId={chatId} />
      </Modal>
    </>
  );
}

interface ChatsProps {
  readonly invitedChatId: number;
}

function Chats({ invitedChatId }: ChatsProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChats());
    dispatch(ContactsSlice.fetch());
  }, [dispatch]);
  const chats = useSelector(ChatsSlice.selectChats);
  const privateChatUsers = useSelector(ChatsSlice.selectPrivateChatUsers);
  const isChatsLoading = !useSelector(ChatsSlice.selectIsLoaded);
  const contacts = useSelector(ContactsSlice.selectAll);
  const isContactsLoading = !useSelector(ContactsSlice.selectIsLoaded);
  if (isChatsLoading || isContactsLoading) return <Spin style={{ padding: 16 }} />;
  const contactCards = contacts
    .filter((userId) => !privateChatUsers!.includes(userId))
    .map((userId) => <ChatCard key={userId} data={userId} invitedChatId={invitedChatId} />);
  const chatCards = chats
    .filter(({ chatId }) => chatId !== invitedChatId)
    .map((chat) => <ChatCard invitedChatId={invitedChatId} key={chat.chatId} data={chat} />);
  return <Cards chatCards={chatCards} contactCards={contactCards} />;
}

interface CardsProps {
  readonly chatCards: ReactElement[];
  readonly contactCards: ReactElement[];
}

function Cards({ contactCards, chatCards }: CardsProps): ReactElement {
  let section: ReactNode;
  if (chatCards.length + contactCards.length === 0)
    section = "You're not in any chats, and don't have any contacts to send invitations to.";
  else
    section = (
      <>
        {chatCards}
        {contactCards}
      </>
    );
  return <Space direction='vertical'>{section}</Space>;
}

interface ChatCardProps {
  /**
   * Instead of passing a {@link ChatsSlice.PrivateChat}, a `number` can be passed which is the ID of the other user in
   * the private chat.
   */
  readonly data: ChatsSlice.Chat | number;
  readonly invitedChatId: number;
}

function ChatCard({ data, invitedChatId }: ChatCardProps): ReactElement {
  const [isVisible, setVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const onConfirm = async () => {
    setLoading(true);
    if (typeof data === 'number') {
      const chatId = await operateCreatePrivateChat(data);
      if (chatId === undefined) {
        setLoading(false);
        setVisible(false);
        return;
      }
      await operateCreateGroupChatInviteMessage(chatId, invitedChatId);
    } else {
      await operateCreateGroupChatInviteMessage(data.chatId, invitedChatId);
    }
    setLoading(false);
    setVisible(false);
  };
  return (
    <Popconfirm
      title='Send invitation?'
      visible={isVisible}
      onConfirm={onConfirm}
      okButtonProps={{ loading: isLoading }}
      onCancel={() => setVisible(false)}
      onVisibleChange={() => setVisible(!isVisible)}
    >
      <Card hoverable size='small' onClick={() => setVisible(true)}>
        <Space>
          {typeof data === 'number' ? <PrivateChatPic userId={data} /> : <ChatPic chat={data} />}
          <ChatName data={data} />
        </Space>
      </Card>
    </Popconfirm>
  );
}

async function operateCreateGroupChatInviteMessage(chatId: number, invitedChatId: number): Promise<void> {
  const response = await createGroupChatInviteMessage(chatId, invitedChatId);
  if (response?.createGroupChatInviteMessage === null) message.success('Invitation sent.', 3);
  else if (response?.createGroupChatInviteMessage?.__typename === 'InvalidChatId')
    message.error("You're no longer in the chat.", 5);
  else if (response?.createGroupChatInviteMessage?.__typename === 'InvalidInvitedChat')
    message.error('This chat no longer accepts invitations.', 5);
}

interface CreateGroupChatInviteMessageResult {
  readonly createGroupChatInviteMessage: InvalidChatId | MustBeAdmin | InvalidInvitedChat | InvalidMessageId | null;
}

interface MustBeAdmin {
  readonly __typename: 'MustBeAdmin';
}

interface InvalidChatId {
  readonly __typename: 'InvalidChatId';
}

interface InvalidInvitedChat {
  readonly __typename: 'InvalidInvitedChat';
}

interface InvalidMessageId {
  readonly __typename: 'InvalidMessageId';
}

async function createGroupChatInviteMessage(
  chatId: number,
  invitedChatId: number,
): Promise<CreateGroupChatInviteMessageResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation CreateGroupChatInviteMessage($chatId: Int!, $invitedChatId: Int!) {
              createGroupChatInviteMessage(chatId: $chatId, invitedChatId: $invitedChatId) {
                __typename
              }
            }
          `,
          variables: { chatId, invitedChatId },
        },
        Storage.readAccessToken()!,
      ),
  );
}
