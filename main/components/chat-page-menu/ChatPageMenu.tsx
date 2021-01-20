import {Menu} from 'antd';
import React, {ReactElement} from 'react';
import {AccountMenuItem} from './AccountMenuItem';
import {SearchUsersMenuItem} from './SearchUsersMenuItem';
import {SupportMenuItem} from './SupportMenuItem';
import {LogOutMenuItem} from './LogOutMenuItem';

export default function ChatPageMenu(): ReactElement {
    return (
        <Menu theme='dark'>
            <AccountMenuItem/>
            <SearchUsersMenuItem/>
            <SupportMenuItem/>
            <LogOutMenuItem/>
        </Menu>
    );
}
