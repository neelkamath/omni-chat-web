import React, {ReactElement, useState} from 'react';
import {Button, Divider, Image, Menu, Modal, Space} from 'antd';
import {CustomerServiceOutlined, LogoutOutlined, SearchOutlined, UserOutlined} from '@ant-design/icons';
import SupportSection from '../../supportSection';
import {logOut} from '../../logOut';
import contactUsImage from '../../static/illustrations/contact_us.svg';
import SearchUsersSection from './chatPageSearchUsersMenuItem';
import ProfilePic from './profilePic';
import NewProfilePicButton from './newProfilePicButton';
import DeleteProfilePicButton from './deleteProfilePicButton';
import UpdateAccountSection from './updateAccountSection';

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

function AccountMenuItem(props: object): ReactElement {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const onCancel = () => setIsModalVisible(false);
    return (
        <Menu.Item {...props}>
            <Button icon={<UserOutlined/>} onClick={() => setIsModalVisible(true)}>Account</Button>
            <Modal title='Update Account' visible={isModalVisible} footer={null} onCancel={onCancel}>
                <Space direction='vertical'>
                    <ProfilePic/>
                    <NewProfilePicButton/>
                    <DeleteProfilePicButton/>
                </Space>
                <Divider/>
                <UpdateAccountSection/>
            </Modal>
        </Menu.Item>
    );
}

function SearchUsersMenuItem(props: object): ReactElement {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const onCancel = () => setIsModalVisible(false);
    return (
        <Menu.Item {...props}>
            <Button icon={<SearchOutlined/>} onClick={() => setIsModalVisible(true)}>Search Users</Button>
            <Modal title='Search Users' visible={isModalVisible} footer={null} onCancel={onCancel}>
                <SearchUsersSection/>
            </Modal>
        </Menu.Item>
    );
}

function SupportMenuItem(props: object): ReactElement {
    const [isModalVisible, setIsModalVisible] = useState(false);
    return (
        <Menu.Item {...props}>
            <Button icon={<CustomerServiceOutlined/>} onClick={() => setIsModalVisible(true)}>Support</Button>
            <Modal title='Support' visible={isModalVisible} footer={null} onCancel={() => setIsModalVisible(false)}>
                <Space direction='vertical'>
                    <Image preview={false} alt='Contact us' src={contactUsImage}/>
                    <SupportSection/>
                </Space>
            </Modal>
        </Menu.Item>
    );
}

function LogOutMenuItem(props: object): ReactElement {
    return (
        <Menu.Item {...props}>
            <Button icon={<LogoutOutlined/>} onClick={logOut}>Log Out</Button>
        </Menu.Item>
    );
}
