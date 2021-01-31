import {Account, BlockedAccount, DeletedContact, NewContact, UnblockedAccount} from '../api/networking/graphql/models';
import React, {ReactElement, useEffect, useState} from 'react';
import {LoadingOutlined, UserOutlined} from '@ant-design/icons';
import {Avatar, Button, Card, Col, List, Modal, Row, Spin, Typography} from 'antd';
import * as restApi from '../api/wrappers/restApi';
import {NonexistentUserIdError} from '../api/networking/errors';
import OriginalProfilePic from './OriginalProfilePic';
import * as mutationsApi from '../api/wrappers/mutationsApi';
import * as queriesApi from '../api/wrappers/queriesApi';
import * as subscriptionsApi from '../api/wrappers/subscriptionsApi';

export interface UserCardProps {
    readonly account: Account;
    /**
     * A modal displaying the user's profile is shown when the card is clicked. This function is called whenever the
     * modal is closed to perform any cleanup actions you may want to perform. For example, if a list of the user's
     * contacts are being displayed, you can update the contacts list because the user may have deleted a contact via
     * the modal.
     */
    readonly onModalClose?: () => void;
}

export default function UserCard({account, onModalClose}: UserCardProps): ReactElement {
    const [isVisible, setVisible] = useState(false);
    const [avatar, setAvatar] = useState(<LoadingOutlined/>);
    useEffect(() => {
        getThumbnailProfilePic(account.id).then((pic) => {
            if (pic !== null) setAvatar(pic);
        });
    }, [account.id]);
    const onCancel = () => {
        setVisible(false);
        if (onModalClose !== undefined) onModalClose();
    };
    return (
        <>
            <Card onClick={() => setVisible(true)}>
                <Row gutter={16} align='middle'>
                    <Col>{avatar}</Col>
                    <Col>
                        <Typography.Text strong>{account.username}</Typography.Text>
                    </Col>
                </Row>
            </Card>
            <Modal footer={null} visible={isVisible} onCancel={onCancel}>
                <Profile account={account}/>
            </Modal>
        </>
    );
}

async function getThumbnailProfilePic(userId: number): Promise<ReactElement | null> {
    let pic;
    try {
        pic = await restApi.getProfilePic(userId, 'THUMBNAIL');
    } catch (error) {
        /*
         A <NonexistentUserIdError> will be caught here if a user who was to be displayed in the search results
         deleted their account in between being searched, and having the profile pic displayed. Since this rarely
         ever happens, and no harm comes from leaving the search result up, we ignore this possibility.
         */
        if (!(error instanceof NonexistentUserIdError)) throw error;
    }
    return <Avatar size='large' src={pic === null ? <UserOutlined/> : URL.createObjectURL(pic)}/>;
}

interface ProfileProps {
    readonly account: Account;
}

function Profile({account}: ProfileProps): ReactElement {
    const [pic, setPic] = useState<ReactElement | null>(null);
    useEffect(() => {
        getOriginalProfilePic(account.id).then(setPic);
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
                <ContactButton userId={account.id}/>
                <BlockButton userId={account.id}/>
            </List.Item>
        </List>
    );
}

async function getOriginalProfilePic(userId: number): Promise<ReactElement | null> {
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

interface ContactButtonProps {
    /** The user whose contact is to be created/deleted. */
    readonly userId: number;
}

function ContactButton({userId}: ContactButtonProps): ReactElement {
    const [button, setButton] = useState(<Spin size='small'/>);
    const [isLoading, setLoading] = useState(false);
    const [isContact, setContact] = useState<boolean | undefined>(undefined);
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
        const update = async () => {
            const response = await queriesApi.isContact(userId);
            if (response !== null) setContact(response);
        };
        return subscriptionsApi.subscribeToAccounts(async (message) => {
            const isContactUpdate = ['NewContact', 'DeletedContact'].includes(message.__typename)
                && (message.data as NewContact | DeletedContact).id === userId;
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
    const [isBlocked, setBlocked] = useState<boolean | undefined>(undefined);
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
        const update = async () => {
            const response = await queriesApi.isBlocked(userId);
            if (response !== null) setBlocked(response);
        };
        return subscriptionsApi.subscribeToAccounts(async (message) => {
            const isBlockedUpdate = ['BlockedAccount', 'UnblockedAccount'].includes(message.__typename)
                && (message.data as BlockedAccount | UnblockedAccount).id === userId;
            if (message.__typename === 'CreatedSubscription' || isBlockedUpdate) await update();
        });
    }, [userId]);
    return button;
}
