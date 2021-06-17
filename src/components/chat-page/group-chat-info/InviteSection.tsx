import React, { ReactElement, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../../store/store';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { Button, Card, Divider, message, Modal, Popconfirm, Space, Spin } from 'antd';
import { ShareAltOutlined } from '@ant-design/icons';
import ChatPic from '../ChatPic';
import ChatName from '../ChatName';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import { Storage } from '../../../Storage';

export interface InviteSectionProps {
  readonly chatId: number;
}

export default function InviteSection({ chatId }: InviteSectionProps): ReactElement {
  const [isVisible, setVisible] = useState(false);
  const publicity = useSelector((state: RootState) => ChatsSlice.selectPublicity(state, chatId));
  if (publicity === undefined) return <Spin />;
  if (publicity === 'NOT_INVITABLE') return <></>;
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

// TODO: Allow inviting your contacts who you don't have chats with as well.
function Chats({ invitedChatId }: ChatsProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChats());
  const chats = useSelector(ChatsSlice.selectChats);
  const isLoading = !useSelector(ChatsSlice.selectIsLoaded);
  if (isLoading) return <Spin style={{ padding: 16 }} />;
  const cards = chats
    .filter(({ chatId }) => chatId !== invitedChatId)
    .map((chat) => <ChatCard invitedChatId={invitedChatId} key={chat.chatId} chat={chat} />);
  return (
    <Space direction='vertical'>{cards.length === 0 ? "You're not in any chats to send invitations to." : cards}</Space>
  );
}

interface ChatCardProps {
  readonly chat: ChatsSlice.Chat;
  readonly invitedChatId: number;
}

function ChatCard({ chat, invitedChatId }: ChatCardProps): ReactElement {
  const [isVisible, setVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const onConfirm = async () => {
    setLoading(true);
    await operateCreateGroupChatInviteMessage(chat.chatId, invitedChatId);
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
          <ChatPic chat={chat} />
          <ChatName chat={chat} />
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
