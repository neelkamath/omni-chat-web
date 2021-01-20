import React, {ReactElement, useEffect, useState} from 'react';
import {Button, Form, Input, Menu, message, Modal, Spin, Typography} from 'antd';
import {UserDeleteOutlined} from '@ant-design/icons';
import * as mutationsApi from '../../api/wrappers/mutationsApi';
import * as queriesApi from '../../api/wrappers/queriesApi';

export default function DeleteAccountMenuItem(props: object): ReactElement {
    const [visible, setVisible] = useState(false);
    return (
        <Menu.Item {...props}>
            <Button icon={<UserDeleteOutlined/>} onClick={() => setVisible(true)}>Delete Account</Button>
            <Modal title='Delete Account' visible={visible} footer={null} onCancel={() => setVisible(false)}>
                <Typography.Paragraph>
                    If you delete your account, all of your data will be wiped. This means that your private chats with
                    other users will be deleted, etc. Since this is an irreversible action, the support team will be
                    unable to retrieve your data if you change your mind later on.
                </Typography.Paragraph>
                <DeleteAccountForm/>
            </Modal>
        </Menu.Item>
    );
}

function DeleteAccountForm(): ReactElement {
    const [form, setForm] = useState(<Spin/>);
    const [username, setUsername] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const onFinish = async (data: any) => {
        setLoading(true);
        data.username === username ? await mutationsApi.deleteAccount() : message.error('Incorrect username.');
        setLoading(false);
    };
    useEffect(() => {
        queriesApi.readAccount().then((account) => {
            if (account === null) return;
            setUsername(account.username);
            setForm(
                <Form onFinish={onFinish} name='updateAccount' layout='vertical'>
                    <Form.Item
                        name='username'
                        label={`Enter your username (${account.username}) to confirm account deletion.`}
                        rules={[{required: true, message: 'Enter your username.'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item>
                        <Button type='primary' htmlType='submit' loading={loading} danger>
                            Permanently Delete Account
                        </Button>
                    </Form.Item>
                </Form>
            );
        });
    }, [loading]);
    return form;
}