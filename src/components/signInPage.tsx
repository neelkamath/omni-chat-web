import React, {ReactElement, useState} from 'react';
import HomeLayout from './homeLayout';
import {Button, Divider, Form, Input, message, Space, Typography} from 'antd';
import {requestTokenSet} from '../api/graphQl/queries';
import {
    CONNECTION_ERROR,
    displayConnectionError,
    displayIncorrectPasswordError,
    displayNonExistentUserError,
    displayUnregisteredEmailAddressError,
    displayUnverifiedEmailAddressError,
    INCORRECT_PASSWORD_ERROR,
    NONEXISTENT_USER_ERROR,
    UNREGISTERED_EMAIL_ADDRESS_ERROR,
    UNVERIFIED_EMAIL_ADDRESS_ERROR
} from '../api/errors';
import {saveTokenSet} from '../storage';
import {emailPasswordResetCode, resetPassword} from '../api/graphQl/mutations';

export default function SignInPage(): ReactElement {
    return (
        <HomeLayout>
            <SignInForm/>
            <Divider/>
            <EmailPasswordResetCodeForm/>
            <Divider/>
            <ResetPasswordForm/>
        </HomeLayout>
    );
}

interface SignInData {
    readonly username: string;
    readonly password: string;
}

function SignInForm(): ReactElement {
    const [loading, setLoading] = useState(false);
    const onFinish = async (formData: SignInData) => {
        setLoading(true);
        await signIn(formData);
        setLoading(false);
    };
    return (
        <>
            <Typography.Title level={2}>Sign In</Typography.Title>
            <Form onFinish={onFinish} name='sign-in' layout='vertical'>
                <Form.Item name='username' label='Username' rules={[{required: true, message: 'Enter your username.'}]}>
                    <Input/>
                </Form.Item>
                <Form.Item name='password' label='Password' rules={[{required: true, message: 'Enter your password.'}]}>
                    <Input.Password/>
                </Form.Item>
                <Form.Item>
                    <Button type='primary' htmlType='submit' loading={loading}>Submit</Button>
                </Form.Item>
            </Form>
        </>
    );
}

async function signIn(data: SignInData): Promise<void> {
    let tokenSet;
    try {
        tokenSet = await requestTokenSet(data);
    } catch (error) {
        switch (error) {
            case CONNECTION_ERROR:
                await displayConnectionError();
                break;
            case NONEXISTENT_USER_ERROR:
                await displayNonExistentUserError();
                break;
            case UNVERIFIED_EMAIL_ADDRESS_ERROR:
                await displayUnverifiedEmailAddressError();
                break;
            case INCORRECT_PASSWORD_ERROR:
                await displayIncorrectPasswordError();
        }
        return;
    }
    saveTokenSet(tokenSet);
    location.href = '/chat';
}

interface PasswordResetCodeData {
    readonly 'email-address': string;
}

function EmailPasswordResetCodeForm(): ReactElement {
    const [loading, setLoading] = useState(false);
    const onFinish = async (formData: PasswordResetCodeData) => {
        setLoading(true);
        await sendPasswordResetCode(formData);
        setLoading(false);
    };
    return (
        <>
            <Typography.Title level={2}>Email Password Reset Code</Typography.Title>
            <Space direction='vertical'>
                <Typography.Text>
                    If you forgot your password, submit this form to receive an email containing a password reset code.
                </Typography.Text>
                <Form onFinish={onFinish} name='email-password-reset-code' layout='vertical'>
                    <Form.Item
                        name='email-address'
                        label='Email address'
                        rules={[{required: true, message: 'Enter your email address.'}]}
                    >
                        <Input type='email'/>
                    </Form.Item>
                    <Form.Item>
                        <Button loading={loading} type='primary' htmlType='submit'>Submit</Button>
                    </Form.Item>
                </Form>
            </Space>
        </>
    );
}

async function sendPasswordResetCode(data: PasswordResetCodeData): Promise<void> {
    try {
        await emailPasswordResetCode(data['email-address']);
    } catch (error) {
        if (error === CONNECTION_ERROR) await displayConnectionError();
        else if (error === UNREGISTERED_EMAIL_ADDRESS_ERROR) await displayUnregisteredEmailAddressError();
        return;
    }
    message.success('Password reset code sent to your email.');
}

interface PasswordResetData {
    readonly 'email-address': string;
    readonly 'password-reset-code': number;
    readonly 'new-password': string;
}

function ResetPasswordForm(): ReactElement {
    const [loading, setLoading] = useState(false);
    const onFinish = async (formData: PasswordResetData) => {
        setLoading(true);
        await setPassword(formData);
        setLoading(false);
    };
    return (
        <>
            <Typography.Title level={2}>Reset Password</Typography.Title>
            <Space direction='vertical'>
                <Typography.Text>
                    If you received an email with a password reset code, submit this form to reset your password.
                </Typography.Text>
                <Form onFinish={onFinish} name='reset-password' layout='vertical'>
                    <Form.Item
                        name='email-address'
                        label='Email address'
                        rules={[{required: true, message: 'Enter your email address.'}]}
                    >
                        <Input type='email'/>
                    </Form.Item>
                    <Form.Item
                        name='password-reset-code'
                        label='Password reset code'
                        rules={[{required: true, message: 'Enter the password reset code.'}]}
                    >
                        <Input type='number'/>
                    </Form.Item>
                    <Form.Item
                        name='new-password'
                        label='New password'
                        rules={[{required: true, message: 'Enter a new password.'}]}
                    >
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item>
                        <Button loading={loading} type='primary' htmlType='submit'>Submit</Button>
                    </Form.Item>
                </Form>
            </Space>
        </>
    )
}

async function setPassword(data: PasswordResetData): Promise<void> {
    let isReset;
    try {
        isReset = await resetPassword(data['email-address'], data['password-reset-code'], data['new-password']);
    } catch (error) {
        if (error === UNREGISTERED_EMAIL_ADDRESS_ERROR) await displayUnregisteredEmailAddressError();
        else await displayConnectionError();
        return;
    }
    if (isReset) message.success('Password reset.'); else message.error('Incorrect password reset code.');
}
