import React, { ReactElement, useState } from 'react';
import { Button, List, message, Modal, Spin, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../store/store';
import { ContactsSlice } from '../../store/slices/ContactsSlice';
import { BlockedUsersSlice } from '../../store/slices/BlockedUsersSlice';
import { PicsSlice } from '../../store/slices/PicsSlice';
import OriginalPic from './OriginalPic';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { ChatsSlice } from '../../store/slices/ChatsSlice';

export interface ProfileModalProps {
  readonly account: ChatsSlice.UserAccount;
  /** Whether to display a button which opens a private chat with this {@link account}. */
  readonly hasChatButton: boolean;
  /** Whether the modal is visible. */
  readonly isVisible: boolean;
  /** Callback for when the user attempts to close the modal. You could set {@link isVisible} to `false` here. */
  readonly onCancel: () => void;
}

export default function ProfileModal({ account, hasChatButton, isVisible, onCancel }: ProfileModalProps): ReactElement {
  return (
    <Modal footer={null} visible={isVisible} onCancel={onCancel}>
      <ProfileSection account={account} hasChatButton={hasChatButton} />
    </Modal>
  );
}

interface ProfileSectionProps {
  readonly account: ChatsSlice.UserAccount;
  /** Whether to display a button which opens a private chat with this {@link account}. */
  readonly hasChatButton: boolean;
}

function ProfileSection({ account, hasChatButton }: ProfileSectionProps): ReactElement {
  const url = useSelector((state: RootState) => PicsSlice.selectPic(state, 'PROFILE_PIC', account.userId, 'ORIGINAL'));
  useThunkDispatch(PicsSlice.fetchPic({ id: account.userId, type: 'PROFILE_PIC' }));
  const name = `${account.firstName} ${account.lastName}`.trim();
  return (
    <List style={{ padding: 16 }}>
      {url === undefined && (
        <List.Item>
          <Spin />
        </List.Item>
      )}
      {url !== undefined && url !== null && (
        <List.Item>
          <OriginalPic type='PROFILE_PIC' url={url} />
        </List.Item>
      )}
      <List.Item>
        <Typography.Text strong>Username</Typography.Text>: {account.username}
      </List.Item>
      {name.length > 0 && (
        <List.Item>
          <Typography.Text strong>Name</Typography.Text>: {name}
        </List.Item>
      )}
      <List.Item>
        <Typography.Text strong>Email address</Typography.Text>: {account.emailAddress}
      </List.Item>
      {account.bio.length > 0 && (
        <List.Item>
          <Typography.Text strong>Bio</Typography.Text>: {account.bio}
        </List.Item>
      )}
      <List.Item>
        <ContactButton userId={account.userId} />
        {hasChatButton && <ChatButton userId={account.userId} />}
        <BlockButton userId={account.userId} />
      </List.Item>
    </List>
  );
}

interface ChatButtonProps {
  /** The ID of the user to create a private chat with. */
  readonly userId: number;
}

function ChatButton({ userId }: ChatButtonProps): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const onClick = async () => {
    setLoading(true);
    const chatId = await operateCreatePrivateChat(userId);
    setLoading(false);
    if (chatId !== undefined) dispatch(ChatPageLayoutSlice.update({ type: 'CHAT_SECTION', chatId }));
  };
  return (
    <Button loading={isLoading} onClick={onClick}>
      Chat
    </Button>
  );
}

async function operateCreatePrivateChat(userId: number): Promise<number | undefined> {
  const result = await createPrivateChat(userId);
  if (result?.createPrivateChat.__typename === 'InvalidUserId') {
    message.warning('The user just deleted their account.', 5);
    return undefined;
  }
  return result?.createPrivateChat.chatId;
}

interface InvalidUserId {
  readonly __typename: 'InvalidUserId';
}

interface CreatedChatId {
  readonly __typename: 'CreatedChatId';
  readonly chatId: number;
}

interface CreatePrivateChatResult {
  readonly createPrivateChat: InvalidUserId | CreatedChatId;
}

async function createPrivateChat(userId: number): Promise<CreatePrivateChatResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation CreatePrivateChat($userId: Int!) {
              createPrivateChat(userId: $userId) {
                __typename
                ... on CreatedChatId {
                  chatId
                }
              }
            }
          `,
          variables: { userId },
        },
        Storage.readAccessToken()!,
      ),
  );
}

interface ContactButtonProps {
  /** The user whose contact is to be created/deleted. */
  readonly userId: number;
}

function ContactButton({ userId }: ContactButtonProps): ReactElement {
  const isButtonLoading = !useSelector(ContactsSlice.selectIsLoaded);
  const [isLoading, setLoading] = useState(false);
  const isContact = useSelector((state: RootState) => ContactsSlice.selectIsContact(state, userId));
  useThunkDispatch(ContactsSlice.fetchContacts());
  if (isButtonLoading) return <Spin size='small' />;
  const onClick = async () => {
    setLoading(true);
    isContact ? await operateDeleteContact(userId) : await operateCreateContact(userId);
    setLoading(false);
  };
  return (
    <Button danger={isContact} loading={isLoading} onClick={onClick}>
      {isContact ? 'Delete' : 'Create'} Contact
    </Button>
  );
}

async function operateCreateContact(userId: number): Promise<void> {
  const result = await createContact(userId);
  if (result?.createContact === true) message.success('Contact created.', 3);
  else if (result?.createContact === false) message.warning('That user just deleted their account.', 5);
}

interface CreateContactResult {
  readonly createContact: boolean;
}

async function createContact(id: number): Promise<CreateContactResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation CreateContact($id: Int!) {
              createContact(id: $id)
            }
          `,
          variables: { id },
        },
        Storage.readAccessToken()!,
      ),
  );
}

async function operateDeleteContact(userId: number): Promise<void> {
  const result = await deleteContact(userId);
  if (result?.deleteContact === true) message.success('Contact deleted', 3);
  else if (result?.deleteContact === false) message.warning('That user just deleted their account', 5);
}

interface DeleteContactResult {
  readonly deleteContact: boolean;
}

async function deleteContact(id: number): Promise<DeleteContactResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation DeleteContact($id: Int!) {
              deleteContact(id: $id)
            }
          `,
          variables: { id },
        },
        Storage.readAccessToken()!,
      ),
  );
}

interface BlockButtonProps {
  /** The user to be (un)blocked. */
  readonly userId: number;
}

function BlockButton({ userId }: BlockButtonProps): ReactElement {
  const isBlocked = useSelector((state: RootState) => BlockedUsersSlice.selectIsBlocked(state, userId));
  const isButtonLoading = !useSelector(BlockedUsersSlice.selectIsLoaded);
  const [isLoading, setLoading] = useState(false);
  useThunkDispatch(BlockedUsersSlice.fetchUsers());
  if (isButtonLoading) return <Spin size='small' />;
  const onClick = async () => {
    setLoading(true);
    isBlocked ? await operateUnblockUser(userId) : await operateBlockUser(userId);
    setLoading(false);
  };
  return (
    <Button danger={!isBlocked} loading={isLoading} onClick={onClick}>
      {isBlocked ? 'Unblock' : 'Block'}
    </Button>
  );
}

async function operateUnblockUser(id: number): Promise<void> {
  const result = await unblockUser(id);
  if (result?.unblockUser === true) message.success('User unblocked.');
  else if (result?.unblockUser === false) message.warning('That user just deleted their account.', 5);
}

interface UnblockUserResult {
  readonly unblockUser: boolean;
}

async function unblockUser(id: number): Promise<UnblockUserResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation UnblockUser($id: Int!) {
              unblockUser(id: $id)
            }
          `,
          variables: { id },
        },
        Storage.readAccessToken()!,
      ),
  );
}

async function operateBlockUser(id: number): Promise<void> {
  const result = await blockUser(id);
  if (result?.blockUser?.__typename === 'InvalidUserId') message.warning('That user just deleted their account.', 5);
  else if (result !== undefined) message.success('User blocked.');
}

interface BlockUserResult {
  readonly blockUser: InvalidUserId | null;
}

async function blockUser(id: number): Promise<BlockUserResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation BlockUser($id: Int!) {
              blockUser(id: $id) {
                __typename
              }
            }
          `,
          variables: { id },
        },
        Storage.readAccessToken()!,
      ),
  );
}
