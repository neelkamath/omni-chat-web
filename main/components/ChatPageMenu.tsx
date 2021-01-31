import {Button, Menu} from 'antd';
import React, {ReactElement, useContext} from 'react';
import ChatPageSupportSection from './ChatPageSupportSection';
import {ChatPageLayoutContext} from '../contexts/chatPageLayoutContext';
import {
    CodeOutlined,
    ContactsOutlined,
    CustomerServiceOutlined,
    LogoutOutlined,
    SearchOutlined,
    StopOutlined,
    UserDeleteOutlined,
    UserOutlined
} from '@ant-design/icons';
import AccountEditor from './AccountEditor';
import SearchUsersSection from './SearchUsersSection';
import logOut from '../logOut';
import DeleteAccountSection from './DeleteAccountSection';
import DevelopersSection from './DevelopersSection';
import ContactsSection from './ContactsSection';
import BlockedUsersSection from './BlockedUsersSection';

export default function ChatPageMenu(): ReactElement {
    const {setContent} = useContext(ChatPageLayoutContext)!;
    return (
        <Menu>
            <Menu.Item>
                <Button icon={<UserOutlined/>} onClick={() => setContent(<AccountEditor/>)}>Account</Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<ContactsOutlined/>} onClick={() => setContent(<ContactsSection/>)}>Contacts</Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<SearchOutlined/>} onClick={() => setContent(<SearchUsersSection/>)}>Search Users</Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<StopOutlined/>} onClick={() => setContent(<BlockedUsersSection/>)}>Blocked Users</Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<CustomerServiceOutlined/>} onClick={() => setContent(<ChatPageSupportSection/>)}>
                    Support
                </Button>
            </Menu.Item>
            <Menu.Item>
                <Button icon={<CodeOutlined/>} onClick={() => setContent(<DevelopersSection/>)}>Developers</Button>
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
