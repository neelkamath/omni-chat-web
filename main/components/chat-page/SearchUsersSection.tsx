import React, {ReactElement, useContext, useState} from 'react';
import {Button, Empty, Form, Input, message, Space} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import {SearchUsersContext, useSearchUsersContext} from '../../contexts/searchUsersContext';
import * as queriesApi from '../../api/wrappers/queriesApi';
import * as storage from '../../storage';
import UserCard from './UserCard';

/** The number of users to query for at a time. */
const QUERY_COUNT = 10;

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function SearchUsersSection(): ReactElement {
    const context = useSearchUsersContext();
    return (
        <Space direction='vertical' style={{padding: 16}}>
            Search users by their name, username, or email address.
            <SearchUsersContext.Provider value={context}>
                <Space direction='vertical'>
                    <SearchUsersForm/>
                    <Users/>
                    {context.users !== undefined && <LoadMoreUsersButton/>}
                </Space>
            </SearchUsersContext.Provider>
        </Space>
    );
}

interface SearchUsersFormData {
    readonly query: string;
}

function SearchUsersForm(): ReactElement {
    const {setQuery, replaceUsers} = useContext(SearchUsersContext)!;
    const [isLoading, setLoading] = useState(false);
    const onFinish = async ({query}: SearchUsersFormData) => {
        setLoading(true);
        const accounts = await queriesApi.searchUsers(query, QUERY_COUNT);
        if (accounts !== undefined) {
            setQuery(query);
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

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function Users(): ReactElement {
    const {users} = useContext(SearchUsersContext)!;
    if (users === undefined) return <></>;
    const cards = users.edges
        .filter(({node}) => node.id !== storage.readUserId()!)
        .map(({node}) => <UserCard key={node.id} account={node}/>);
    return cards.length === 0 ? <Empty/> : <Space direction='vertical'>{cards}</Space>;
}

function LoadMoreUsersButton(): ReactElement {
    const {query, users, addUsers} = useContext(SearchUsersContext)!;
    const [isLoading, setLoading] = useState(false);
    const onClick = async () => {
        if (users!.pageInfo.hasNextPage) {
            setLoading(true);
            const after = users!.edges[users!.edges.length - 1]!.cursor;
            const connection = await queriesApi.searchUsers(query!, QUERY_COUNT, after);
            if (connection !== undefined) addUsers(connection);
            setLoading(false);
        } else message.info('No more users found.');
    };
    return <Button loading={isLoading} onClick={onClick}>Load more users</Button>;
}
