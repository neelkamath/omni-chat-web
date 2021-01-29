import React, {ReactElement, useContext, useState} from 'react';
import {Button, Empty, Form, Input, message, Space, Typography} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import {SearchUsersContext, useSearchUsersContext} from '../contexts/searchUsersContext';
import * as queriesApi from '../api/wrappers/queriesApi';
import * as storage from '../storage';
import UserFound from './UserFound';

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
    const {accounts, contacts, updateContacts} = useContext(SearchUsersContext)!;
    if (accounts === undefined) return <></>;
    const cards = accounts.edges
        .filter(({node}) => node.id !== storage.readUserId()!)
        .map(({node}) =>
            <UserFound
                key={node.id}
                account={node}
                isContact={contacts.includes(node.id)}
                onContactStatusChange={updateContacts}
            />
        );
    return cards.length === 0 ? <Empty/> : <>{cards}</>;
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
