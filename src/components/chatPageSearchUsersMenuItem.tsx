import React, {ReactElement, useEffect, useState} from 'react';
import {Account} from '../api/graphQlApi/models';
import {Avatar, Button, Card, Empty, Form, Input, List, Menu, Modal, Space, Typography} from 'antd';
import {LoadingOutlined, SearchOutlined, UserOutlined} from '@ant-design/icons';
import * as queries from '../api/graphQlApi/queries';
import {displayConnectionError, NONEXISTENT_USER_ID_ERROR} from '../api/errors';
import * as restApi from '../api/restApi';

export default function ChatPageSearchUsersMenuItem(props: object): ReactElement {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [accounts, setAccounts] = useState<Account[] | undefined>(undefined);
    const onCancel = () => setIsModalVisible(false);
    return (
        <Menu.Item {...props}>
            <Button icon={<SearchOutlined/>} onClick={() => setIsModalVisible(true)}>Search Users</Button>
            <Modal title='Search Users' visible={isModalVisible} footer={null} onCancel={onCancel}>
                <Space direction='vertical'>
                    Search users by their name, username, or email address.
                    <SearchUsersForm callback={setAccounts}/>
                    <UsersFound accounts={accounts}/>
                </Space>
            </Modal>
        </Menu.Item>
    );
}

interface SearchUsersProps {
    /** Called with the search results whenever users are searched for. */
    callback(accounts: Account[]): void;
}

interface UsersSearchData {
    readonly query: string;
}

function SearchUsersForm(props: SearchUsersProps): ReactElement {
    const [loading, setIsLoading] = useState(false);
    const onFinish = async (data: UsersSearchData) => {
        setIsLoading(true);
        const accounts = await searchUsers(data);
        if (accounts !== null) props.callback(accounts);
        setIsLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='search-users' layout='inline'>
            <Form.Item name='query' initialValue=''>
                <Input/>
            </Form.Item>
            <Form.Item>
                <Button loading={loading} type='primary' htmlType='submit' icon={<SearchOutlined/>}/>
            </Form.Item>
        </Form>
    );
}

async function searchUsers(data: UsersSearchData): Promise<Account[] | null> {
    let connection;
    try {
        connection = await queries.searchUsers(data.query);
    } catch (error) {
        await displayConnectionError();
        return null;
    }
    return connection.edges.map((edge) => edge.node);
}

interface UsersFoundProps {
    /**
     * `undefined` if no users have been searched for yet. An empty array if users have been searched for but none have
     * been found.
     */
    readonly accounts?: Account[];
}

function UsersFound(props: UsersFoundProps): ReactElement {
    if (props.accounts === undefined) return <></>;
    const cards = props.accounts.map((account) =>
        <Card key={account.id}>
            <UserFound account={account}/>
        </Card>
    );
    return cards.length === 0 ? <Empty/> : <>{cards}</>;
}

interface UserFoundProps {
    readonly account: Account;
}

function UserFound(props: UserFoundProps): ReactElement {
    const [avatar, setAvatar] = useState(<LoadingOutlined/>);
    useEffect(() => {
        getProfilePic(props.account.id).then((pic) => {
            if (pic !== null) setAvatar(pic);
        });
    }, []);
    return (
        <Card.Meta
            title={props.account.username}
            avatar={avatar}
            description={<UserFoundDescription account={props.account}/>}
        />
    );
}

async function getProfilePic(userId: number): Promise<ReactElement | null> {
    let pic;
    try {
        pic = await restApi.getProfilePic(userId);
    } catch (error) {
        /*
         A <NONEXISTENT_USER_ID_ERROR> will be caught here if a user who was to be displayed in the search results
         deleted their account in between being searched, and having the profile pic displayed. Since this rarely ever
         happens, and no harm comes from leaving the search result up, we ignore this possibility.
         */
        if (error !== NONEXISTENT_USER_ID_ERROR) await displayConnectionError();
        return null;
    }
    return <Avatar size='large' src={pic === null ? <UserOutlined/> : URL.createObjectURL(pic)}/>;
}

interface UserFoundDescriptionProps {
    readonly account: Account;
}

function UserFoundDescription(props: UserFoundDescriptionProps): ReactElement {
    const name = `${props.account.firstName} ${props.account.lastName}`;
    return (
        <List>
            {
                name.trim().length > 0 && (
                    <List.Item>
                        <Typography.Text strong>Name</Typography.Text>: {name}
                    </List.Item>
                )
            }
            <List.Item>
                <Typography.Text strong>Email address</Typography.Text>: {props.account.emailAddress}
            </List.Item>
            {
                props.account.bio.trim().length > 0 && (
                    <List.Item>
                        <Typography.Text strong>Bio</Typography.Text>: {props.account.bio}
                    </List.Item>
                )
            }
        </List>
    );
}
