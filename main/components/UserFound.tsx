import {Account} from '../api/networking/graphql/models';
import React, {ReactElement, useEffect, useState} from 'react';
import {LoadingOutlined, UserOutlined} from '@ant-design/icons';
import {Avatar, Button, Card, Col, List, Modal, Row, Typography} from 'antd';
import * as restApi from '../api/wrappers/restApi';
import {NonexistentUserIdError} from '../api/networking/errors';
import OriginalProfilePic from './OriginalProfilePic';
import * as mutationsApi from '../api/wrappers/mutationsApi';

export interface UserFoundProps {
    readonly account: Account;
    /** Whether the `account` is in the user's contacts. */
    readonly isContact: boolean;
    /** Called when the `account` is either added or removed from the user's contacts. */
    readonly onContactStatusChange: () => void;
}

export default function UserFound(props: UserFoundProps): ReactElement {
    const [visible, setVisible] = useState(false);
    const [avatar, setAvatar] = useState(<LoadingOutlined/>);
    useEffect(() => {
        getThumbnailProfilePic(props.account.id).then((pic) => {
            if (pic !== null) setAvatar(pic);
        });
    }, [props.account.id]);
    return (
        <>
            <Card onClick={() => setVisible(true)}>
                <Row gutter={16} align='middle'>
                    <Col>{avatar}</Col>
                    <Col>
                        <Typography.Text strong>{props.account.username}</Typography.Text>
                    </Col>
                </Row>
            </Card>
            <Modal footer={null} visible={visible} onCancel={() => setVisible(false)}>
                <Profile {...props}/>
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
    /** Whether the `account` is in the user's contacts. */
    readonly isContact: boolean;
    /** Called when the `account` is either added or removed from the user's contacts. */
    readonly onContactStatusChange: () => void;
}

function Profile({account, isContact, onContactStatusChange}: ProfileProps): ReactElement {
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
                <ContactButton
                    userId={account.id}
                    isContact={isContact}
                    onContactStatusChange={onContactStatusChange}
                />
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
    readonly userId: number;
    /** Whether the `account` is in the user's contacts. */
    readonly isContact: boolean;
    /** Called when the `account` is either added or removed from the user's contacts. */
    readonly onContactStatusChange: () => void;
}

function ContactButton({userId, isContact, onContactStatusChange}: ContactButtonProps): ReactElement {
    const [loading, setLoading] = useState(false);
    const onClick = async () => {
        setLoading(true);
        isContact ? await mutationsApi.deleteContacts([userId]) : await mutationsApi.createContacts([userId]);
        onContactStatusChange();
        setLoading(false);
    };
    return (
        <Button danger={isContact} loading={loading} onClick={onClick}>
            {isContact ? 'Delete' : 'Create'} Contact
        </Button>
    );
}
