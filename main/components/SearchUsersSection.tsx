import React, {ReactElement, useContext, useEffect, useState} from 'react';
import {Avatar, Button, Card, Empty, Form, Input, List, message, Space, Typography} from 'antd';
import {LoadingOutlined, SearchOutlined, UserOutlined} from '@ant-design/icons';
import {SearchUsersContext, useSearchUsersContext} from '../contexts/searchUsersContext';
import * as queriesApi from '../api/wrappers/queriesApi';
import {Account} from '../api/networking/graphql/models';
import * as restApi from '../api/wrappers/restApi';
import {NonexistentUserIdError} from '../api/networking/errors';
import * as mutationsApi from '../api/wrappers/mutationsApi';
import * as storage from '../storage';

/** The number of users to query for at a time. */
const QUERY_COUNT = 10;

export default function SearchUsersSection(): ReactElement {
    const context = useSearchUsersContext();
    return (
        <>
            <Typography.Paragraph>Search users by their name, username, or email address.</Typography.Paragraph>
            <SearchUsersContext.Provider value={context}>
                <Space direction='vertical'>
                    <SearchUsersForm/>
                    <UsersFound/>
                    {context.accounts !== undefined && <LoadMoreUsersButton/>}
                </Space>
            </SearchUsersContext.Provider>
        </>
    );
}

function SearchUsersForm(): ReactElement {
    const {setQuery, replaceAccounts} = useContext(SearchUsersContext)!;
    const [loading, setLoading] = useState(false);
    const onFinish = async (data: any) => {
        setLoading(true);
        const accounts = await queriesApi.searchUsers(data.query, QUERY_COUNT);
        if (accounts !== null) {
            setQuery(data.query);
            replaceAccounts(accounts);
        }
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='searchUsers' layout='inline'>
            <Form.Item name='query' initialValue=''>
                <Input/>
            </Form.Item>
            <Form.Item>
                <Button loading={loading} type='primary' htmlType='submit' icon={<SearchOutlined/>}/>
            </Form.Item>
        </Form>
    );
}

function UsersFound(): ReactElement {
    const {accounts} = useContext(SearchUsersContext)!;
    if (accounts === undefined) return <></>;
    const cards = accounts.edges.filter(({node}) => node.id !== storage.readUserId()!).map(({node}) =>
        <Card key={node.id}>
            <UserFound account={node}/>
        </Card>
    );
    return cards.length === 0 ? <Empty/> : <>{cards}</>;
}

interface UserFoundProps {
    readonly account: Account;
}

function UserFound({account}: UserFoundProps): ReactElement {
    const [avatar, setAvatar] = useState(<LoadingOutlined/>);
    useEffect(() => {
        getProfilePic(account.id).then((pic) => {
            if (pic !== null) setAvatar(pic);
        });
    }, []);
    return (
        <Card.Meta
            title={account.username}
            avatar={avatar}
            description={<UserFoundDescription account={account}/>}
        />
    );
}

async function getProfilePic(userId: number): Promise<ReactElement | null> {
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

interface UserFoundDescriptionProps {
    readonly account: Account;
}

function UserFoundDescription({account}: UserFoundDescriptionProps): ReactElement {
    const name = `${account.firstName} ${account.lastName}`;
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
                <ContactManagementButton userId={account.id}/>
            </List.Item>
        </List>
    );
}

function LoadMoreUsersButton(): ReactElement {
    const {query, accounts, addAccounts} = useContext(SearchUsersContext)!;
    const [loading, setLoading] = useState(false);
    const onClick = async () => {
        if (accounts!.pageInfo.hasNextPage) {
            setLoading(true);
            const after = accounts!.edges[accounts!.edges.length - 1]!.cursor;
            const connection = await queriesApi.searchUsers(query!, QUERY_COUNT, after);
            if (connection !== null) addAccounts(connection);
            setLoading(false);
        } else message.info('No more users found.');
    };
    return <Button loading={loading} onClick={onClick}>Load more users</Button>;
}

interface ContactManagementButtonProps {
    readonly userId: number;
}

function ContactManagementButton({userId}: ContactManagementButtonProps): ReactElement {
    const {contacts, updateContacts} = useContext(SearchUsersContext)!;
    const [loading, setLoading] = useState(false);
    const onClick = async () => {
        setLoading(true);
        if (contacts.includes(userId)) await mutationsApi.deleteContacts([userId]);
        else await mutationsApi.createContacts([userId]);
        updateContacts();
        setLoading(false);
    };
    return (
        <Button danger={contacts.includes(userId)} loading={loading} onClick={onClick}>
            {contacts.includes(userId) ? 'Delete Contact' : 'Create Contact'}
        </Button>
    );
}
