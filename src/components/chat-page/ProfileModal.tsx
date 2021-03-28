import React, { ReactElement, useState } from 'react';
import { Button, List, message, Modal, Spin, Typography } from 'antd';
import {
  Account,
  blockUser,
  createContacts,
  createPrivateChat,
  deleteContacts,
  unblockUser,
} from '@neelkamath/omni-chat';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../store/store';
import { ContactsSlice } from '../../store/slices/ContactsSlice';
import { BlockedUsersSlice } from '../../store/slices/BlockedUsersSlice';
import { PicsSlice } from '../../store/slices/PicsSlice';
import OriginalProfilePic from './OriginalProfilePic';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';

export interface ProfileModalProps {
  readonly account: Account;
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
  readonly account: Account;
  /** Whether to display a button which opens a private chat with this {@link account}. */
  readonly hasChatButton: boolean;
}

function ProfileSection({ account, hasChatButton }: ProfileSectionProps) {
  const url = useSelector((state: RootState) => PicsSlice.selectPic(state, 'PROFILE_PIC', account.id, 'ORIGINAL'));
  useThunkDispatch(PicsSlice.fetchPic({ id: account.id, type: 'PROFILE_PIC' }));
  const name = `${account.firstName} ${account.lastName}`.trim();
  return (
    <List>
      {url === undefined && (
        <List.Item>
          <Spin />
        </List.Item>
      )}
      {url !== undefined && url !== null && (
        <List.Item>
          <OriginalProfilePic url={url} />
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
        <ContactButton userId={account.id} />
        {hasChatButton && <ChatButton userId={account.id} />}
        <BlockButton userId={account.id} />
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
  const result = await operateGraphQlApi(() => createPrivateChat(httpApiConfig, Storage.readAccessToken()!, userId));
  if (result?.createPrivateChat.__typename === 'InvalidUserId') {
    message.warning('The user just deleted their account.', 5);
    return undefined;
  }
  return result?.createPrivateChat.id;
}

interface ContactButtonProps {
  /** The user whose contact is to be created/deleted. */
  readonly userId: number;
}

// TODO: Once Omni Chat Backend 0.18.0 releases, update this to state whether the user deleted their account.
function ContactButton({ userId }: ContactButtonProps): ReactElement {
  const isButtonLoading = !useSelector(ContactsSlice.selectIsLoaded);
  const [isLoading, setLoading] = useState(false);
  const isContact = useSelector((state: RootState) => ContactsSlice.selectIsContact(state, userId));
  useThunkDispatch(ContactsSlice.fetchContacts());
  if (isButtonLoading) return <Spin size='small' />;
  const onClick = async () => {
    setLoading(true);
    isContact ? await operateDeleteContacts(userId) : await operateCreateContacts(userId);
    setLoading(false);
  };
  return (
    <Button danger={isContact} loading={isLoading} onClick={onClick}>
      {isContact ? 'Delete' : 'Create'} Contact
    </Button>
  );
}

async function operateCreateContacts(userId: number): Promise<void> {
  const result = await operateGraphQlApi(() => createContacts(httpApiConfig, Storage.readAccessToken()!, [userId]));
  if (result !== undefined) message.success('Contact created.', 3);
}

async function operateDeleteContacts(userId: number): Promise<void> {
  const result = await operateGraphQlApi(() => deleteContacts(httpApiConfig, Storage.readAccessToken()!, [userId]));
  if (result !== undefined) message.success('Contact deleted', 3);
}

interface BlockButtonProps {
  /** The user to be (un)blocked. */
  readonly userId: number;
}

// TODO: Once Omni Chat Backend 0.18.0 releases, update this to state whether the user deleted their account.
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

async function operateUnblockUser(userId: number): Promise<void> {
  const result = await operateGraphQlApi(() => unblockUser(httpApiConfig, Storage.readAccessToken()!, userId));
  if (result !== undefined) message.success('User unblocked.');
}

async function operateBlockUser(userId: number): Promise<void> {
  const result = await operateGraphQlApi(() => blockUser(httpApiConfig, Storage.readAccessToken()!, userId));
  if (result !== undefined) message.success('User blocked.');
}
