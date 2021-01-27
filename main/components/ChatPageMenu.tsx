import {Button, Menu} from 'antd';
import React, {ReactElement, useContext} from 'react';
import ChatPageLayoutSupportSection from './ChatPageLayoutSupportSection';
import {ChatPageLayoutContext} from '../contexts/chatPageLayoutContext';
import {
    CustomerServiceOutlined,
    LogoutOutlined,
    SearchOutlined,
    UserDeleteOutlined,
    UserOutlined
} from '@ant-design/icons';
import AccountEditor from './AccountEditor';
import SearchUsersSection from './SearchUsersSection';
import {logOut} from '../logOut';
import DeleteAccountSection from './DeleteAccountSection';

export default function ChatPageMenu(): ReactElement {
    const {setContent} = useContext(ChatPageLayoutContext)!;
    return (
        <Menu>
            <Menu.Item>
                <Button icon={<UserOutlined/>} onClick={() => setContent(<AccountEditor/>)}>Account</Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<SearchOutlined/>} onClick={() => setContent(<SearchUsersSection/>)}>Search Users</Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<CustomerServiceOutlined/>} onClick={() => setContent(<ChatPageLayoutSupportSection/>)}>
                    Support
                </Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<UserDeleteOutlined/>} onClick={() => setContent(<DeleteAccountSection/>)}>
                    Delete Account
                </Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<LogoutOutlined/>} onClick={logOut}>Log Out</Button>
            </Menu.Item>
        </Menu>
    );
}
