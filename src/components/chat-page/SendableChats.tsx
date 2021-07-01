import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChatsSlice } from '../../store/slices/ChatsSlice';
import { ContactsSlice } from '../../store/slices/ContactsSlice';
import { Card, message, Popconfirm, Space, Spin } from 'antd';
import operateCreatePrivateChat from '../../operateCreatePrivateChat';
import PrivateChatPic from './PrivateChatPic';
import ChatPic from './ChatPic';
import ChatName from './ChatName';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { Storage } from '../../Storage';

export interface SendableChatsProps {
  /** The chat the message is getting sent from. */
  readonly chatId: number;
  /**
   * - If the {@link type} is `'GROUP_CHAT_INVITATION'`, then this must be `undefined`.
   * - If the {@link type} is `'FORWARDED_MESSAGE'`, then this must be the ID of the message getting forwarded.
   */
  readonly messageId?: number;
  readonly type: SendableChatType;
}

export type SendableChatType = 'GROUP_CHAT_INVITATION' | 'FORWARDED_MESSAGE';

// TODO: Paginate.
export default function SendableChats({ chatId, type, messageId }: SendableChatsProps): ReactElement {
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
  const id = getId(type, chatId, messageId);
  const contactCards = contacts
    .filter((userId) => !privateChatUsers!.includes(userId))
    .map((userId) => <ChatCard id={id} type={type} key={userId} data={userId} />);
  const chatCards = chats.map((chat) => <ChatCard id={id} type={type} key={chat.chatId} data={chat} />);
  return <Cards type={type} chatCards={chatCards} contactCards={contactCards} />;
}

function getId(type: SendableChatType, chatId: number, messageId: number | undefined): number {
  switch (type) {
    case 'GROUP_CHAT_INVITATION':
      return chatId;
    case 'FORWARDED_MESSAGE':
      return messageId!;
  }
}

interface CardsProps {
  readonly chatCards: ReactElement[];
  readonly contactCards: ReactElement[];
  readonly type: SendableChatType;
}

function Cards({ contactCards, chatCards, type }: CardsProps): ReactElement {
  let section: ReactNode;
  if (chatCards.length + contactCards.length === 0) {
    let text: string;
    switch (type) {
      case 'FORWARDED_MESSAGE':
        text = 'forward messages';
        break;
      case 'GROUP_CHAT_INVITATION':
        text = 'send invitations';
    }
    section = `You're not in any chats, and don't have any contacts to ${text} to.`;
  } else
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
  readonly type: SendableChatType;
  /**
   * - If the {@link type} is `'GROUP_CHAT_INVITATION'`, then this must be the invited chat's ID.
   * - If the {@link type} is `'FORWARDED_MESSAGE'`, then this must be the ID of the message to be forwarded.
   */
  readonly id: number;
}

function ChatCard({ type, data, id }: ChatCardProps): ReactElement {
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
      await operateApi(type, chatId, id);
    } else await operateApi(type, data.chatId, id);
    setLoading(false);
    setVisible(false);
  };
  return (
    <Popconfirm
      title={getTitle(type)}
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

async function operateApi(type: SendableChatType, chatId: number, id: number): Promise<void> {
  switch (type) {
    case 'GROUP_CHAT_INVITATION':
      await operateCreateGroupChatInviteMessage(chatId, id);
      break;
    case 'FORWARDED_MESSAGE':
      await operateForwardMessage(chatId, id);
  }
}

function getTitle(type: SendableChatType): string {
  switch (type) {
    case 'FORWARDED_MESSAGE':
      return 'Forward message?';
    case 'GROUP_CHAT_INVITATION':
      return 'Send invitation?';
  }
}

async function operateCreateGroupChatInviteMessage(chatId: number, invitedChatId: number): Promise<void> {
  const response = await createGroupChatInviteMessage(chatId, invitedChatId);
  if (response?.createGroupChatInviteMessage === null) message.success('Invitation sent.', 3);
  else if (response?.createGroupChatInviteMessage.__typename === 'InvalidChatId')
    message.error("You're no longer in the chat.", 5);
  else if (response?.createGroupChatInviteMessage.__typename === 'InvalidInvitedChat')
    message.error('This chat no longer accepts invitations.', 5);
  else if (response?.createGroupChatInviteMessage.__typename === 'MustBeAdmin')
    message.error('You must be an admin to send an invitation in that chat.', 5);
}

async function operateForwardMessage(chatId: number, messageId: number): Promise<void> {
  const response = await forwardMessage(chatId, messageId);
  if (response?.forwardMessage === null) message.success('Message sent.', 3);
  else if (response?.forwardMessage.__typename === 'InvalidChatId') message.error("You're no longer in the chat.", 5);
  else if (response?.forwardMessage.__typename === 'InvalidMessageId')
    message.error('The message just got deleted.', 5);
  else if (response?.forwardMessage.__typename === 'MustBeAdmin')
    message.error('You must be an admin to forward a message in that chat.', 5);
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

interface ForwardMessageResult {
  readonly forwardMessage: InvalidChatId | InvalidMessageId | MustBeAdmin | null;
}

interface InvalidChatId {
  readonly __typename: 'InvalidChatId';
}

interface InvalidMessageId {
  readonly __typename: 'InvalidMessageId';
}

interface MustBeAdmin {
  readonly __typename: 'MustBeAdmin';
}

async function forwardMessage(chatId: number, messageId: number): Promise<ForwardMessageResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation ForwardMessage($chatId: Int!, $messageId: Int!) {
              forwardMessage(chatId: $chatId, messageId: $messageId) {
                __typename
              }
            }
          `,
          variables: { chatId, messageId },
        },
        Storage.readAccessToken()!,
      ),
  );
}
