import React, {ReactElement, useEffect, useState} from 'react';
import {Button, Form, Input, message, Space, Spin} from 'antd';
import * as mutationsApi from '../../api/wrappers/mutationsApi';
import * as queriesApi from '../../api/wrappers/queriesApi';

export default function DeleteAccountSection(): ReactElement {
    return (
        <Space direction='vertical' style={{padding: 16}}>
            If you delete your account, all of your data will be wiped. This means that your private chats with other
            users will be deleted, etc. Since this is an irreversible action, the support team will be unable to
            retrieve your data if you change your mind later on.
            <DeleteAccountForm/>
        </Space>
    );
}

interface DeleteAccountFormData {
    readonly username: string;
}

function DeleteAccountForm(): ReactElement {
    const [form, setForm] = useState(<Spin/>);
    const [username, setUsername] = useState<string | undefined>();
    const [isLoading, setLoading] = useState(false);
    useEffect(() => {
        const onFinish = async (data: DeleteAccountFormData) => {
            setLoading(true);
            data.username === username ? await mutationsApi.deleteAccount() : message.error('Incorrect username.');
            setLoading(false);
        };
        queriesApi.readAccount().then((account) => {
            if (account === undefined) return;
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
                        <Button type='primary' htmlType='submit' loading={isLoading} danger>
                            Permanently Delete Account
                        </Button>
                    </Form.Item>
                </Form>
            );
        });
    }, [isLoading, username]);
    return form;
}