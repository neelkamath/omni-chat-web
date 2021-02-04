import {
    Account,
    BlockedAccount,
    DeletedContact,
    NewContact,
    UnblockedAccount
} from '../../api/networking/graphql/models';
import React, {ReactElement, ReactNode, useContext, useEffect, useState} from 'react';
import {Button, List, Modal, Spin, Typography} from 'antd';
import * as restApi from '../../api/wrappers/restApi';
import {NonexistentUserIdError} from '../../api/networking/errors';
import OriginalProfilePic from './OriginalProfilePic';
import {ChatPageLayoutContext} from '../../contexts/chatPageLayoutContext';
import * as mutationsApi from '../../api/wrappers/mutationsApi';
import ChatSection from './ChatSection';
import * as queriesApi from '../../api/wrappers/queriesApi';
import * as subscriptionsApi from '../../api/wrappers/subscriptionsApi';

export interface ProfileProps {
    readonly account: Account;
    /** Whether to display a button which opens a private chat with this {@link account}. */
    readonly hasChatButton: boolean;
    /** Whether the modal is visible. */
    readonly isVisible: boolean;
    /** Callback for when the user attempts to close the modal. You could set {@link isVisible} to `false` here. */
    readonly onCancel: () => void;
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function ProfileModal({account, hasChatButton, isVisible, onCancel}: ProfileProps): ReactElement {
    return (
        <Modal footer={null} visible={isVisible} onCancel={onCancel}>
            <ProfileSection account={account} hasChatButton={hasChatButton}/>
        </Modal>
    );
}

interface ProfileSectionProps {
    readonly account: Account;
    /** Whether to display a button which opens a private chat with this {@link account}. */
    readonly hasChatButton: boolean;
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function ProfileSection({account, hasChatButton}: ProfileSectionProps) {
    const [pic, setPic] = useState<ReactNode>(null);
    useEffect(() => {
        getProfilePic(account.id).then(setPic);
    }, [account.id]);
    const name = `${account.firstName} ${account.lastName}`;
    return (
        <List>
            {pic !== null && <List.Item>{pic}</List.Item>}
            <List.Item>
                <Typography.Text strong>Username</Typography.Text>: {account.username}
            </List.Item>
            {
                name.trim().length > 0 && (
                    <List.Item>
                        <Typography.Text strong>Name</Typography.Text>: {name}
                    </List.Item>
                )
            }
            <List.Item>
                <Typography.Text strong>Email address</Typography.Text>: {account.emailAddress}
            </List.Item>
            {
                account.bio.trim().length > 0 && (
                    <List.Item>
                        <Typography.Text strong>Bio</Typography.Text>: {account.bio}
                    </List.Item>
                )
            }
            <List.Item>
                {hasChatButton && <ChatButton userId={account.id}/>}
                <ContactButton userId={account.id}/>
                <BlockButton userId={account.id}/>
            </List.Item>
        </List>
    );
}

async function getProfilePic(userId: number): Promise<ReactNode> {
    let pic = null;
    try {
        pic = await restApi.getProfilePic(userId, 'ORIGINAL');
    } catch (error) {
        /*
         A <NonexistentUserIdError> will be caught here if a user who was to be displayed in the search results
         deleted their account in between being searched, and having the profile pic displayed. Since this rarely
         ever happens, and no harm comes from leaving the search result up, we ignore this possibility.
         */
        if (!(error instanceof NonexistentUserIdError)) throw error;
    }
    return pic === null ? null : <OriginalProfilePic pic={pic}/>;
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
        const chatId = await mutationsApi.createPrivateChat(userId);
        setLoading(false);
        if (chatId !== undefined) setContent(<ChatSection chatId={chatId}/>);
    };
    return <Button loading={isLoading} onClick={onClick}>Chat</Button>;
}

interface ContactButtonProps {
    /** The user whose contact is to be created/deleted. */
    readonly userId: number;
}

function ContactButton({userId}: ContactButtonProps): ReactElement {
    const [button, setButton] = useState(<Spin size='small'/>);
    const [isLoading, setLoading] = useState(false);
    const [isContact, setContact] = useState<boolean | undefined>();
    useEffect(() => {
        if (isContact === undefined) return;
        const onClick = async () => {
            setLoading(true);
            isContact ? await mutationsApi.deleteContacts([userId]) : await mutationsApi.createContacts([userId]);
            setLoading(false);
        };
        setButton(
            <Button danger={isContact} loading={isLoading} onClick={onClick}>
                {isContact ? 'Delete' : 'Create'} Contact
            </Button>
        );
    }, [isLoading, isContact, userId]);
    useEffect(() => {
        const update = async () => setContact(await queriesApi.isContact(userId));
        return subscriptionsApi.subscribeToAccounts(async (message) => {
            const isContactUpdate = ['NewContact', 'DeletedContact'].includes(message.__typename)
                && (message as NewContact | DeletedContact).id === userId;
            if (message.__typename === 'CreatedSubscription' || isContactUpdate) await update();
        });
    }, [userId]);
    return button;
}

interface BlockButtonProps {
    /** The user to be (un)blocked. */
    readonly userId: number;
}

function BlockButton({userId}: BlockButtonProps): ReactElement {
    const [button, setButton] = useState(<Spin size='small'/>);
    const [isLoading, setLoading] = useState(false);
    const [isBlocked, setBlocked] = useState<boolean | undefined>();
    useEffect(() => {
        if (isBlocked === undefined) return;
        const onClick = async () => {
            setLoading(true);
            isBlocked ? await mutationsApi.unblockUser(userId) : await mutationsApi.blockUser(userId);
            setLoading(false);
        };
        setButton(
            <Button danger={!isBlocked} loading={isLoading} onClick={onClick}>
                {isBlocked ? 'Unblock' : 'Block'}
            </Button>
        );
    }, [userId, isLoading, isBlocked]);
    useEffect(() => {
        const update = async () => setBlocked(await queriesApi.isBlocked(userId));
        return subscriptionsApi.subscribeToAccounts(async (message) => {
            const isBlockedUpdate = ['BlockedAccount', 'UnblockedAccount'].includes(message.__typename)
                && (message as BlockedAccount | UnblockedAccount).id === userId;
            if (message.__typename === 'CreatedSubscription' || isBlockedUpdate) await update();
        });
    }, [userId]);
    return button;
}
