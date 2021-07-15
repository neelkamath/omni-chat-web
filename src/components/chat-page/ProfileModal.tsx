import React, { ReactElement, useEffect, useState } from 'react';
import { Button, List, message, Modal, Spin, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { ContactsSlice } from '../../store/slices/ContactsSlice';
import { BlockedUsersSlice } from '../../store/slices/BlockedUsersSlice';
import { ImagesSlice } from '../../store/slices/ImagesSlice';
import OriginalImage from './OriginalImage';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { AccountsSlice } from '../../store/slices/AccountsSlice';
import { RootState } from '../../store/store';
import operateCreatePrivateChat from '../../operateCreatePrivateChat';
import gfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';

export interface ProfileModalProps {
  readonly userId: number;
  /** Whether to display a button which opens a private chat with this {@link userId}. */
  readonly hasChatButton: boolean;
  /** Whether the modal is visible. */
  readonly isVisible: boolean;
  /** Callback for when the user attempts to close the modal. You could set {@link isVisible} to `false` here. */
  readonly onCancel: () => void;
}

export default function ProfileModal({ userId, hasChatButton, isVisible, onCancel }: ProfileModalProps): ReactElement {
  return (
    <Modal footer={null} visible={isVisible} onCancel={onCancel}>
      <ProfileSection userId={userId} hasChatButton={hasChatButton} />
    </Modal>
  );
}

interface ProfileSectionProps {
  readonly userId: number;
  /** Whether to display a button which opens a private chat with this {@link account}. */
  readonly hasChatButton: boolean;
}

function ProfileSection({ userId, hasChatButton }: ProfileSectionProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ImagesSlice.fetch({ id: userId, type: 'PROFILE_IMAGE' }));
    dispatch(AccountsSlice.fetch(userId));
  }, [dispatch, userId]);
  const url = useSelector((state: RootState) => ImagesSlice.selectImage(state, 'PROFILE_IMAGE', userId, 'ORIGINAL'));
  const user = useSelector((state: RootState) => AccountsSlice.select(state, userId));
  if (user === undefined) return <Spin />;
  const name = `${user.firstName} ${user.lastName}`.trim();
  return (
    <List style={{ padding: 16 }}>
      {url === undefined && (
        <List.Item>
          <Spin />
        </List.Item>
      )}
      {url !== undefined && url !== null && (
        <List.Item>
          <OriginalImage type='PROFILE_IMAGE' url={url} />
        </List.Item>
      )}
      <List.Item>
        <Typography.Text strong>Username</Typography.Text>: {user.username}
      </List.Item>
      {name.length > 0 && (
        <List.Item>
          <Typography.Text strong>Name</Typography.Text>: {name}
        </List.Item>
      )}
      <List.Item>
        <Typography.Text strong>Email address</Typography.Text>: {user.emailAddress}
      </List.Item>
      {user.bio.length > 0 && (
        <List.Item>
          <Typography.Text strong>Bio</Typography.Text>: <ReactMarkdown plugins={[gfm]}>{user.bio}</ReactMarkdown>
        </List.Item>
      )}
      <List.Item>
        <ContactButton userId={userId} />
        {hasChatButton && <ChatButton userId={userId} />}
        <BlockButton userId={userId} />
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

interface ContactButtonProps {
  /** The user whose contact is to be created/deleted. */
  readonly userId: number;
}

function ContactButton({ userId }: ContactButtonProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ContactsSlice.fetch());
  }, [dispatch]);
  const isButtonLoading = !useSelector(ContactsSlice.selectIsLoaded);
  const [isLoading, setLoading] = useState(false);
  const isContact = useSelector((state: RootState) => ContactsSlice.selectIsContact(state, userId));
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
  const response = await createContact(userId);
  if (response?.createContact === true) message.success('Contact created.', 3);
  else if (response?.createContact === false) message.warning('That user just deleted their account.', 5);
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
  const response = await deleteContact(userId);
  if (response?.deleteContact === true) message.success('Contact deleted', 3);
  else if (response?.deleteContact === false) message.warning('That user just deleted their account', 5);
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
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(BlockedUsersSlice.fetch());
  }, [dispatch]);
  const isBlocked = useSelector((state: RootState) => BlockedUsersSlice.selectIsBlocked(state, userId));
  const isButtonLoading = !useSelector(BlockedUsersSlice.selectIsLoaded);
  const [isLoading, setLoading] = useState(false);
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
  const response = await unblockUser(id);
  if (response?.unblockUser === true) message.success('User unblocked.');
  else if (response?.unblockUser === false) message.warning('That user just deleted their account.', 5);
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
  const response = await blockUser(id);
  if (response?.blockUser?.__typename === 'InvalidUserId') message.warning('That user just deleted their account.', 5);
  else if (response !== undefined) message.success('User blocked.');
}

interface BlockUserResult {
  readonly blockUser: InvalidUserId | null;
}

interface InvalidUserId {
  readonly __typename: 'InvalidUserId';
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
