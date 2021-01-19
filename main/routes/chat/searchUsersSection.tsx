import React, {ReactElement} from 'react';
import {Space, Typography} from 'antd';
import {SearchUsersContext, useSearchUsersContext} from '../../searchUsersContext';
import SearchUsersForm from './searchUsersForm';
import UsersFound from './usersFound';

export default function SearchUsersSection(): ReactElement {
    const [accounts, replaceAccounts] = useSearchUsersContext();
    return (
        <>
            <Typography.Paragraph>Search users by their name, username, or email address.</Typography.Paragraph>
            <SearchUsersContext.Provider value={{accounts, replaceAccounts}}>
                <Space direction='vertical'>
                    <SearchUsersForm/>
                    <UsersFound/>
                </Space>
            </SearchUsersContext.Provider>
        </>
    );
}
