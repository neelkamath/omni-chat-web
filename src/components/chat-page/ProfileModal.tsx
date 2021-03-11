import React, {ReactElement, useContext, useState} from 'react';
import {Button, List, Modal, Spin, Typography} from 'antd';
import {ChatPageLayoutContext} from '../../chatPageLayoutContext';
import ChatSection from './ChatSection';
import {Account} from '@neelkamath/omni-chat';
import {MutationsApiWrapper} from '../../api/MutationsApiWrapper';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../store/store';
import {ContactsSlice} from '../../store/slices/ContactsSlice';
import {BlockedUsersSlice} from '../../store/slices/BlockedUsersSlice';
import {PicsSlice} from '../../store/slices/PicsSlice';

export interface ProfileModalProps {
  readonly account: Account;
  /**
   * Whether to display a button which opens a private chat with this
   * {@link account}.
   */
  readonly hasChatButton: boolean;
  /** Whether the modal is visible. */
  readonly isVisible: boolean;
  /**
   * Callback for when the user attempts to close the modal. You could set
   * {@link isVisible} to `false` here.
   */
  readonly onCancel: () => void;
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function ProfileModal({
                                       account,
                                       hasChatButton,
                                       isVisible,
                                       onCancel,
                                     }: ProfileModalProps): ReactElement {
  return (
    <Modal footer={null} visible={isVisible} onCancel={onCancel}>
      <ProfileSection account={account} hasChatButton={hasChatButton}/>
    </Modal>
  );
}

interface ProfileSectionProps {
  readonly account: Account;
  /**
   * Whether to display a button which opens a private chat with this
   * {@link account}.
   */
  readonly hasChatButton: boolean;
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function ProfileSection({account, hasChatButton}: ProfileSectionProps) {
  const pic = useSelector((state: RootState) =>
    PicsSlice.selectPic(state, 'PROFILE_PIC', account.id, 'ORIGINAL')
  );
  const dispatch = useDispatch();
  dispatch(PicsSlice.fetchPic({id: account.id, type: 'PROFILE_PIC'}));
  const name = `${account.firstName} ${account.lastName}`;
  return (
    <List>
      {pic === undefined && (
        <List.Item>
          <Spin/>
        </List.Item>
      )}
      {pic !== undefined && pic !== null && <List.Item>{pic}</List.Item>}
      <List.Item>
        <Typography.Text strong>Username</Typography.Text>: {account.username}
      </List.Item>
      {name.trim().length > 0 && (
        <List.Item>
          <Typography.Text strong>Name</Typography.Text>: {name}
        </List.Item>
      )}
      <List.Item>
        <Typography.Text strong>Email address</Typography.Text>:{' '}
        {account.emailAddress}
      </List.Item>
      {account.bio.trim().length > 0 && (
        <List.Item>
          <Typography.Text strong>Bio</Typography.Text>: {account.bio}
        </List.Item>
      )}
      <List.Item>
        {hasChatButton && <ChatButton userId={account.id}/>}
        <ContactButton userId={account.id}/>
        <BlockButton userId={account.id}/>
      </List.Item>
    </List>
  );
}

interface ChatButtonProps {
  /** The ID of the user to create a private chat with. */
  readonly userId: number;
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function ChatButton({userId}: ChatButtonProps): ReactElement {
  const {setContent} = useContext(ChatPageLayoutContext)!;
  const [isLoading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    const chatId = await MutationsApiWrapper.createPrivateChat(userId);
    setLoading(false);
    if (chatId !== undefined) setContent(<ChatSection chatId={chatId}/>);
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

function ContactButton({userId}: ContactButtonProps): ReactElement {
  const isButtonLoading = useSelector(ContactsSlice.selectIsLoaded);
  const [isLoading, setLoading] = useState(false);
  const isContact = useSelector((state: RootState) =>
    ContactsSlice.selectIsContact(state, userId)
  );
  const dispatch = useDispatch();
  dispatch(ContactsSlice.fetchContacts());
  if (isButtonLoading) return <Spin size="small"/>;
  const onClick = async () => {
    setLoading(true);
    if (isContact) await MutationsApiWrapper.deleteContacts([userId]);
    else await MutationsApiWrapper.createContacts([userId]);
    setLoading(false);
  };
  return (
    <Button danger={isContact} loading={isLoading} onClick={onClick}>
      {isContact ? 'Delete' : 'Create'} Contact
    </Button>
  );
}

interface BlockButtonProps {
  /** The user to be (un)blocked. */
  readonly userId: number;
}

function BlockButton({userId}: BlockButtonProps): ReactElement {
  const isBlocked = useSelector((state: RootState) =>
    BlockedUsersSlice.selectIsBlocked(state, userId)
  );
  const isButtonLoading = useSelector(BlockedUsersSlice.selectIsLoaded);
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  dispatch(BlockedUsersSlice.fetchUsers());
  if (isButtonLoading) return <Spin size="small"/>;
  const onClick = async () => {
    setLoading(true);
    isBlocked
      ? await MutationsApiWrapper.unblockUser(userId)
      : await MutationsApiWrapper.blockUser(userId);
    setLoading(false);
  };
  return (
    <Button danger={!isBlocked} loading={isLoading} onClick={onClick}>
      {isBlocked ? 'Unblock' : 'Block'}
    </Button>
  );
}
