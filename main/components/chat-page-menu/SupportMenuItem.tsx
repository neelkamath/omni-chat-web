import React, {ReactElement, useState} from 'react';
import {Button, Image, Menu, Modal, Space} from 'antd';
import {CustomerServiceOutlined} from '@ant-design/icons';
import contactUsImage from '../../static/illustrations/contact_us.svg';
import SupportSection from '../SupportSection';

export function SupportMenuItem(props: object): ReactElement {
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
