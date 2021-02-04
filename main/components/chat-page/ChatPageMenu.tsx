import {Avatar, Button, Card, Col, Menu, Row, Spin, Tag, Typography} from 'antd';
import React, {ReactElement, useContext, useEffect, useState} from 'react';
import ChatPageSupportSection from './ChatPageSupportSection';
import {ChatPageLayoutContext} from '../../contexts/chatPageLayoutContext';
import * as restApi from '../../api/wrappers/restApi';
import {
    CodeOutlined,
    ContactsOutlined,
    CustomerServiceOutlined,
    LogoutOutlined,
    SearchOutlined,
    StopOutlined,
    TeamOutlined,
    UserDeleteOutlined,
    UserOutlined
} from '@ant-design/icons';
import AccountEditor from './AccountEditor';
import SearchUsersSection from './SearchUsersSection';
import logOut from '../../logOut';
import DeleteAccountSection from './DeleteAccountSection';
import DevelopersSection from '../DevelopersSection';
import ContactsSection from './ContactsSection';
import BlockedUsersSection from './BlockedUsersSection';
import * as queriesApi from '../../api/wrappers/queriesApi';
import {
    ActionMessage,
    Chat,
    GroupChat,
    PicMessage,
    PollMessage,
    PrivateChat,
    TextMessage,
} from '../../api/networking/graphql/models';
import ChatSection from './ChatSection';
import {NonexistentChatError, NonexistentUserIdError} from '../../api/networking/errors';
import * as subscriptionsApi from '../../api/wrappers/subscriptionsApi';

// TODO: Use Redux throughout codebase. Either use with React Context API, or ban Context API.
// TODO: Break into multiple files.

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function ChatPageMenu(): ReactElement {
    const {setContent} = useContext(ChatPageLayoutContext)!;
    return (
        <Menu>
            <Menu.Item>
                <Button icon={<UserOutlined/>} onClick={() => setContent(<AccountEditor/>)}>Account</Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<ContactsOutlined/>} onClick={() => setContent(<ContactsSection/>)}>Contacts</Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<SearchOutlined/>} onClick={() => setContent(<SearchUsersSection/>)}>Search Users</Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<StopOutlined/>} onClick={() => setContent(<BlockedUsersSection/>)}>Blocked Users</Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<CustomerServiceOutlined/>} onClick={() => setContent(<ChatPageSupportSection/>)}>
                    Support
                </Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<CodeOutlined/>} onClick={() => setContent(<DevelopersSection/>)}>Developers</Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<UserDeleteOutlined/>} onClick={() => setContent(<DeleteAccountSection/>)}>
                    Delete Account
                </Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<LogoutOutlined/>} onClick={logOut}>Log Out</Button>
            </Menu.Item>
            <Chats/>
        </Menu>
    );
}

// TODO: Test.
/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function Chats(): ReactElement {
    const [chats, setChats] = useState<Chat[] | undefined>(undefined); // TODO: Sort them by newest message first.
    useEffect(() => {
        const setAll = async () => {
            const response = await readChats();
            if (response === undefined) return;
            const filtered = response.filter(async (chat) => {
                return chat.__typename === 'GroupChat'
                    || await queriesApi.isBlocked((chat as PrivateChat).user.id) !== false;
            });
            setChats(filtered);
        };
        const onAccountsSubscriptionClose = subscriptionsApi.subscribeToAccounts(async (message) => {
            const types = ['CreatedSubscription', 'BlockedAccount', 'UnblockedAccount', 'UpdatedAccount'];
            if (types.includes(message.__typename)) await setAll();
        });
        const onMessagesSubscriptionClose = subscriptionsApi.subscribeToMessages(setAll);
        return () => {
            onAccountsSubscriptionClose();
            onMessagesSubscriptionClose();
        };
    }, []);
    if (chats === undefined) return <Spin/>;
    const items = chats.map((chat) => {
        return (
            <Menu.Item>
                <ChatCard chat={chat}/>
            </Menu.Item>
        );
    });
    return <>{items}</>;
}

async function readChats(): Promise<Chat[] | undefined> {
    const privateChatMessagesPagination = {last: 1};
    const groupChatUsersPagination = {first: 0};
    const groupChatMessagesPagination = {last: 1};
    return await queriesApi.readChats(
        privateChatMessagesPagination,
        groupChatUsersPagination,
        groupChatMessagesPagination,
    );
}

interface ChatCardProps {
    readonly chat: Chat;
}

// TODO: Test.
// TODO: Ensure long messages and chat names don't overflow.
/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function ChatCard({chat}: ChatCardProps): ReactElement {
    const {setContent} = useContext(ChatPageLayoutContext)!;
    return (
        <Card hoverable={true} onClick={() => setContent(<ChatSection chatId={chat.id}/>)}>
            <Row>
                <Col>
                    <ChatPic chat={chat}/>
                </Col>
                <Col>
                    <ChatName chat={chat}/>
                    <ChatTags chat={chat}/>
                    <LastChatMessage chat={chat}/>
                </Col>
            </Row>
        </Card>
    );
}

interface ChatPicProps {
    readonly chat: Chat;
}

function ChatPic({chat}: ChatPicProps): ReactElement {
    if (chat.__typename === 'PrivateChat') return <PrivateChatPic userId={(chat as PrivateChat).user.id}/>;
    return <GroupChatPic chatId={chat.id}/>;
}

interface ChatNameProps {
    readonly chat: Chat;
}

// TODO: Test.
function ChatName({chat}: ChatNameProps): ReactElement {
    return (
        <Typography.Text strong>
            {chat.__typename === 'PrivateChat' ? (chat as PrivateChat).user.username : (chat as GroupChat).title}
        </Typography.Text>
    );
}

interface ChatTagsProps {
    readonly chat: Chat;
}

// TODO: Test.
function ChatTags({chat}: ChatTagsProps): ReactElement {
    let tags = [];
    if (chat.__typename === 'PrivateChat') tags.push('Private');
    else {
        tags.push(<Tag>Group</Tag>);
        if ((chat as GroupChat).isBroadcast) tags.push('Broadcast');
        if ((chat as GroupChat).publicity === 'PUBLIC') tags.push('Public');
    }
    return <>{tags.map((tag) => <Tag>{tag}</Tag>)}</>;
}

interface LastChatMessageProps {
    readonly chat: Chat;
}

// TODO: Test.
function LastChatMessage({chat}: LastChatMessageProps): ReactElement {
    const edges = chat.messages.edges;
    if (edges.length === 0) return <></>;
    let message;
    const node = edges[edges.length - 1]!.node;
    switch (node.__typename) {
        case 'TextMessage':
            message = (node as TextMessage).message;
            break;
        case 'ActionMessage':
            message = (node as ActionMessage).message.text;
            break;
        case 'PicMessage':
            const caption = (node as PicMessage).caption;
            message = caption === null ? <Typography.Text strong>Sent a picture.</Typography.Text> : caption;
            break;
        case 'PollMessage':
            message = (node as PollMessage).poll.title;
            break;
        case 'AudioMessage':
            message = <Typography.Text strong>Sent an audio.</Typography.Text>;
            break;
        case 'DocMessage':
            message = <Typography.Text strong>Sent a document.</Typography.Text>;
            break;
        case 'GroupChatInviteMessage':
            message = <Typography.Text strong>Sent a group chat invite.</Typography.Text>;
            break;
        case 'VideoMessage':
            message = <Typography.Text strong>Send a video.</Typography.Text>;
    }
    return <Typography.Paragraph>{node.sender.username}: {message}</Typography.Paragraph>;
}

interface PrivateChatPicProps {
    readonly userId: number;
}

// TODO: Test.
function PrivateChatPic({userId}: PrivateChatPicProps): ReactElement {
    const [pic, setPic] = useState(<Spin size='small'/>);
    useEffect(() => {
        const update = async () => {
            let response = null;
            try {
                response = await restApi.getProfilePic(userId, 'THUMBNAIL');
            } catch (error) {
                /*
                A <NonexistentUserIdError> will get thrown when the user deletes their account. It's the responsibility
                of the parent element to handle this accordingly.
                 */
                if (!(error instanceof NonexistentUserIdError)) throw error;
            }
            // TODO: Maybe set size to large;
            setPic(<Avatar size='large' src={response === null ? <UserOutlined/> : URL.createObjectURL(response)}/>);
        };
        return subscriptionsApi.subscribeToAccounts(async (message) => {
            const isUpdatedAccount = message.__typename === 'UpdatedAccount' && message.userId === userId;
            if (message.__typename === 'CreatedSubscription' || isUpdatedAccount) await update();
        });
    }, [userId]);
    return pic;
}

interface GroupChatPicProps {
    readonly chatId: number;
}

function GroupChatPic({chatId}: GroupChatPicProps): ReactElement {
    const [pic, setPic] = useState(<Spin size='small'/>);
    useEffect(() => {
        const update = async () => {
            let response = null;
            try {
                response = await restApi.getGroupChatPic(chatId, 'THUMBNAIL');
            } catch (error) {
                /*
                A <NonexistentChatError> gets thrown when the chat was just deleted. The parent element must handle
                this.
                 */
                if (!(error instanceof NonexistentChatError)) throw error;
            }
            setPic(<Avatar size='large' src={response === null ? <TeamOutlined/> : URL.createObjectURL(response)}/>);
        };
        return subscriptionsApi.subscribeToGroupChats(async (message) => {
            if (message.__typename === 'UpdatedGroupChat') await update();
        })
    }, [chatId]);
    return pic;
}
