import React, {ReactElement, useContext, useState} from 'react';
import {SearchUsersContext} from '../../searchUsersContext';
import {Button, Form, Input} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import {Account} from '../../api/graphQlApi/models';
import {Queries} from '../../api/graphQlApi/queries';
import {ConnectionError, InternalServerError} from '../../api/errors';

interface UsersSearchData {
    readonly query: string;
}

export default function SearchUsersForm(): ReactElement {
    const context = useContext(SearchUsersContext);
    const [loading, setIsLoading] = useState(false);
    const onFinish = async (data: UsersSearchData) => {
        setIsLoading(true);
        const accounts = await searchUsers(data);
        if (accounts !== null) context!.replaceAccounts(accounts);
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
        connection = await Queries.searchUsers(data.query);
    } catch (error) {
        if (error instanceof ConnectionError) await ConnectionError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else throw error;
        return null;
    }
    return connection.edges.map((edge) => edge.node);
}
