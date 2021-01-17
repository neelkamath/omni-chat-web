import {Button, Form, Input, message, Spin, Typography} from 'antd';
import React, {ReactElement, useEffect, useState} from 'react';
import {Account} from '../../api/graphQlApi/models';
import * as queries from '../../api/graphQlApi/queries';
import * as storage from '../../storage';
import {
    displayConnectionError,
    displayEmailAddressTakenError,
    displayUsernameTakenError,
    EMAIL_ADDRESS_TAKEN_ERROR,
    UNAUTHORIZED_ERROR,
    USERNAME_TAKEN_ERROR
} from '../../api/errors';
import {logOut} from '../../logOut';
import * as mutations from '../../api/graphQlApi/mutations';

export default function UpdateAccountSection(): ReactElement {
    return (
        <>
            <Typography.Paragraph>
                If you update your email address, you'll be logged out since you'll have to verify your new email
                address.
            </Typography.Paragraph>
            <UpdateAccountForm/>
        </>
    );
}

interface AccountUpdateData {
    readonly username: string;
    /** An empty string indicates the password mustn't be updated. */
    readonly password: string;
    readonly 'email-address': string;
    readonly 'first-name': string;
    readonly 'last-name': string;
    readonly bio: string;
}

function UpdateAccountForm(): ReactElement {
    const [form, setForm] = useState(<Spin/>);
    const [loading, setLoading] = useState(false);
    const onFinish = async (formData: AccountUpdateData) => {
        setLoading(true);
        await updateAccount(formData);
        setLoading(false);
    };
    useEffect(() => {
        readAccount().then((account) => {
            if (account === null) return;
            setForm(
                <Form onFinish={onFinish} name='update-account' layout='vertical'>
                    <Form.Item
                        name='username'
                        label='Username'
                        initialValue={account.username}
                        rules={[{required: true, message: 'Enter a username.'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item name='password' label='Password' initialValue=''>
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item
                        name='email-address'
                        label='Email address'
                        initialValue={account.emailAddress}
                        rules={[{required: true, message: 'Enter an email address.'}]}
                    >
                        <Input type='email'/>
                    </Form.Item>
                    <Form.Item name='first-name' label='First name' initialValue={account.firstName}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name='last-name' label='Last name' initialValue={account.lastName}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name='bio' label='Bio' initialValue={account.bio}>
                        <Input.TextArea/>
                    </Form.Item>
                    <Form.Item>
                        <Button type='primary' htmlType='submit' loading={loading}>Submit</Button>
                    </Form.Item>
                </Form>
            );
        });
    }, [loading]);
    return form;
}

async function readAccount(): Promise<Account | null> {
    let account;
    try {
        account = await queries.readAccount(storage.readTokenSet()!.accessToken);
    } catch (error) {
        error === UNAUTHORIZED_ERROR ? logOut() : await displayConnectionError();
        return null;
    }
    return account;
}

async function updateAccount(data: AccountUpdateData): Promise<void> {
    let oldAccount;
    try {
        oldAccount = await queries.readAccount(storage.readTokenSet()!.accessToken);
        await mutations.updateAccount(storage.readTokenSet()!.accessToken, {
            username: data.username,
            password: data.password.length === 0 ? undefined : data.password,
            emailAddress: data['email-address'],
            firstName: data['first-name'],
            lastName: data['last-name'],
            bio: data.bio,
        });
    } catch (error) {
        switch (error) {
            case UNAUTHORIZED_ERROR:
                logOut();
                break;
            case USERNAME_TAKEN_ERROR:
                await displayUsernameTakenError();
                break;
            case EMAIL_ADDRESS_TAKEN_ERROR:
                await displayEmailAddressTakenError();
                break;
            default:
                await displayConnectionError();
        }
        return;
    }
    message.success('Account updated.');
    if (oldAccount.emailAddress !== data['email-address']) logOut();
}
