import React, {ReactElement, useContext, useState} from 'react';
import {Button, Empty, Form, Input, message, Space, Typography} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import {SearchUsersContext, useSearchUsersContext} from '../contexts/searchUsersContext';
import * as queriesApi from '../api/wrappers/queriesApi';
import * as storage from '../storage';
import UserCard from './UserCard';

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
                    <Users/>
                    {context.users !== undefined && <LoadMoreUsersButton/>}
                </Space>
            </SearchUsersContext.Provider>
        </>
    );
}

function SearchUsersForm(): ReactElement {
    const {setQuery, replaceUsers} = useContext(SearchUsersContext)!;
    const [isLoading, setLoading] = useState(false);
    const onFinish = async (data: any) => {
        setLoading(true);
        const accounts = await queriesApi.searchUsers(data.query, QUERY_COUNT);
        if (accounts !== null) {
            setQuery(data.query);
            replaceUsers(accounts);
        }
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='searchUsers' layout='inline'>
            <Form.Item name='query' initialValue=''>
                <Input/>
            </Form.Item>
            <Form.Item>
                <Button loading={isLoading} type='primary' htmlType='submit' icon={<SearchOutlined/>}/>
            </Form.Item>
        </Form>
    );
}

function Users(): ReactElement {
    const {users} = useContext(SearchUsersContext)!;
    if (users === undefined) return <></>;
    const cards = users.edges
        .filter(({node}) => node.id !== storage.readUserId()!)
        .map(({node}) => <UserCard key={node.id} account={node}/>);
    return cards.length === 0 ? <Empty/> : <>{cards}</>;
}

function LoadMoreUsersButton(): ReactElement {
    const {query, users, addUsers} = useContext(SearchUsersContext)!;
    const [isLoading, setLoading] = useState(false);
    const onClick = async () => {
        if (users!.pageInfo.hasNextPage) {
            setLoading(true);
            const after = users!.edges[users!.edges.length - 1]!.cursor;
            const connection = await queriesApi.searchUsers(query!, QUERY_COUNT, after);
            if (connection !== null) addUsers(connection);
            setLoading(false);
        } else message.info('No more users found.');
    };
    return <Button loading={isLoading} onClick={onClick}>Load more users</Button>;
}
