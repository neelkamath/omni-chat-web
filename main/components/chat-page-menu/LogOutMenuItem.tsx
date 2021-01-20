import React, {ReactElement} from 'react';
import {Button, Menu} from 'antd';
import {LogoutOutlined} from '@ant-design/icons';
import {logOut} from '../../logOut';

export function LogOutMenuItem(props: object): ReactElement {
    return (
        <Menu.Item {...props}>
            <Button icon={<LogoutOutlined/>} onClick={logOut}>Log Out</Button>
        </Menu.Item>
    );
}
