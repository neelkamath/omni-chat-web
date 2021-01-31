import React, {ReactElement, useState} from 'react';
import {Empty, Spin} from 'antd';
import UserCard from './UserCard';
import * as queriesApi from '../api/wrappers/queriesApi';
import {Account} from '../api/networking/graphql/models';

export default function BlockedUsersSection(): ReactElement {
    const [users, setUsers] = useState<Account[] | undefined>(undefined);
    const updateUsers = async () => {
        const response = await queriesApi.readBlockedUsers();
        if (response !== null) setUsers(response.edges.map(({node}) => node));
    };
    if (users === undefined) {
        // noinspection JSIgnoredPromiseFromCall
        updateUsers();
        return <Spin/>;
    }
    const cards = users.map((user) => <UserCard key={user.id} account={user} onModalClose={updateUsers}/>);
    return cards.length === 0 ? <Empty/> : <>{cards}</>;
}
