import {Account, PrivateChat} from '../../api/networking/graphql/models';
import React, {ReactElement, useContext, useEffect, useState} from 'react';
import {Avatar, Button, Col, Empty, Layout, Row, Spin, Typography} from 'antd';
import {InfoCircleOutlined, UserOutlined} from '@ant-design/icons';
import ProfileModal from './ProfileModal';
import {ChatPageLayoutContext} from '../../contexts/chatPageLayoutContext';
import * as restApi from '../../api/wrappers/restApi';
import {NonexistentUserIdError} from '../../api/networking/errors';
import ChatMessage from './ChatMessage';
import * as subscriptionsApi from '../../api/wrappers/subscriptionsApi';
import * as queriesApi from '../../api/wrappers/queriesApi';

export interface PrivateChatSectionProps {
    readonly chat: PrivateChat;
}

// TODO: Create and read messages.
/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function PrivateChatSection({chat}: PrivateChatSectionProps): ReactElement {
    return (
        <Layout>
            <Layout.Header>
                <Header user={chat.user} chatId={chat.id}/>
            </Layout.Header>
            <Layout.Content>
                {chat.messages.edges.map(({node}) => <ChatMessage key={node.messageId} message={node}/>)}
            </Layout.Content>
        </Layout>
    );
}

interface HeaderProps {
    /** The user being chatted with. */
    readonly user: Account;
    readonly chatId: number;
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function Header({user, chatId}: HeaderProps): ReactElement {
    const [isVisible, setVisible] = useState(false);
    const onCancel = () => setVisible(false);
    return (
        <Row gutter={16}>
            <Col>
                <ProfilePic userId={user.id}/>
            </Col>
            <Col>
                <Typography.Text style={{color: 'white'}} strong>{user.username}</Typography.Text>
            </Col>
            <OnlineStatusSection userId={user.id}/>
            <TypingStatusSection userId={user.id} chatId={chatId}/>
            <Col>
                <Button ghost onClick={() => setVisible(true)} icon={<InfoCircleOutlined/>}/>
                <ProfileModal account={user} hasChatButton={false} isVisible={isVisible} onCancel={onCancel}/>
            </Col>
        </Row>
    );
}

interface OnlineStatusSectionProps {
    readonly userId: number;
}

function OnlineStatusSection({userId}: OnlineStatusSectionProps): ReactElement {
    const [onlineStatus, setOnlineStatus] = useState(<Spin size='small'/>);
    useEffect(() => {
        const update = async () => {
            const response = await queriesApi.readOnlineStatuses();
            if (response === undefined) return;
            const onlineStatus = response.find((status) => status.userId === userId)!;
            let status;
            if (onlineStatus.isOnline) status = 'online';
            else if (onlineStatus.lastOnline === null) status = 'offline';
            else status = `last online ${new Date(onlineStatus.lastOnline).toLocaleString()}`;
            setOnlineStatus(<Typography.Text style={{color: 'white'}}>{status}</Typography.Text>);
        };
        return subscriptionsApi.subscribeToOnlineStatuses(async (message) => {
            const isStatusUpdate = message.__typename === 'UpdatedOnlineStatus' && message.userId === userId;
            if (message.__typename === 'CreatedSubscription' || isStatusUpdate) await update();
        });
    }, [userId]);
    return <Col>{onlineStatus}</Col>;
}

interface TypingStatusSectionProps {
    readonly userId: number;
    readonly chatId: number;
}

function TypingStatusSection({userId, chatId}: TypingStatusSectionProps): ReactElement {
    const [isTyping, setTyping] = useState(false);
    useEffect(() => {
        return subscriptionsApi.subscribeToTypingStatuses((message) => {
            if (message.__typename === 'TypingStatus' && message.userId == userId && message.chatId === chatId)
                setTyping(message.isTyping);
        });
    }, [userId, chatId]);
    return <Col flex='auto'>{isTyping ? '·typing...' : ''}</Col>;
}

interface ProfilePicProps {
    readonly userId: number;
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function ProfilePic({userId}: ProfilePicProps): ReactElement {
    const {setContent} = useContext(ChatPageLayoutContext)!;
    const [pic, setPic] = useState(<UserOutlined/>);
    useEffect(() => {
        restApi.getProfilePic(userId, 'THUMBNAIL').then((thumbnail) => {
            if (thumbnail !== null) setPic(<Avatar size='large' src={URL.createObjectURL(thumbnail)}/>);
        }).catch((error) => {
            if (error instanceof NonexistentUserIdError) {
                // noinspection JSIgnoredPromiseFromCall
                NonexistentUserIdError.display();
                setContent(<Empty style={{padding: 16}}/>);
            } else throw error;
        });
    }, [userId, setContent]);
    return pic;
}
