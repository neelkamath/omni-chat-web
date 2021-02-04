import React, {ReactElement, useState} from 'react';
import {Col, Empty, Space, Spin} from 'antd';
import UserCard from './UserCard';
import * as queriesApi from '../../api/wrappers/queriesApi';
import {Account} from '../../api/networking/graphql/models';

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function BlockedUsersSection(): ReactElement {
    const [users, setUsers] = useState<Account[] | undefined>();
    const updateUsers = async () => {
        const response = await queriesApi.readBlockedUsers();
        if (response !== undefined) setUsers(response.edges.map(({node}) => node));
    };
    if (users === undefined) {
        // noinspection JSIgnoredPromiseFromCall
        updateUsers();
        return <Spin style={{padding: 16}}/>;
    }
    const cards = users.map((user) => <UserCard key={user.id} account={user} onModalClose={updateUsers}/>);
    const content = cards.length === 0 ? <Empty/> : <Space direction='vertical'>{cards}</Space>;
    return <Col style={{padding: 16}}>{content}</Col>;
}
