import React, {ReactElement, useState} from 'react';
import {Button, Image, Menu, Modal, Space} from 'antd';
import {CustomerServiceOutlined, LogoutOutlined} from '@ant-design/icons';
import SupportSection from './supportSection';
import {logOut} from '../logOut';
// @ts-ignore: Cannot find module '../../static/illustrations/contact_us.svg' or its corresponding type declarations.
import contactUsImage from '../../static/illustrations/contact_us.svg';
import ChatPageAccountMenuItem from './chatPageAccountMenuItem';
import ChatPageSearchUsersMenuItem from './chatPageSearchUsersMenuItem';

export default function ChatPageMenu(): ReactElement {
    return (
        <Menu theme='dark'>
            <ChatPageAccountMenuItem/>
            <ChatPageSearchUsersMenuItem/>
            <SupportMenuItem/>
            <Menu.Item>
                <Button icon={<LogoutOutlined/>} onClick={logOut}>Log Out</Button>
            </Menu.Item>
        </Menu>
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
