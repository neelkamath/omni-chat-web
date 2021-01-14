import React, {ReactElement, useState} from 'react';
import HomeLayout from './homeLayout';
import {Button, Col, Divider, Form, Image, Input, message, Row, Space, Typography} from 'antd';
import * as queries from '../api/graphQlApi/queries';
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
import * as storage from '../storage';
import * as mutations from '../api/graphQlApi/mutations';
// @ts-ignore: Cannot find module '../../static/illustrations/sign_in.svg' or its corresponding type declarations.
import signInImage from '../../static/illustrations/sign_in.svg';
// @ts-ignore: Cannot find module '../../static/illustrations/mail_sent.svg' or its corresponding type declarations.
import mailSentImage from '../../static/illustrations/mail_sent.svg';
// @ts-ignore: Cannot find module '../../static/illustrations/forgot_password.svg' or its corresponding type declarations.
import forgotPasswordImage from '../../static/illustrations/forgot_password.svg';
// @ts-ignore: Cannot find module '../../static/illustrations/authentication.svg' or its corresponding type declarations.
import authenticationImage from '../../static/illustrations/authentication.svg';

export default function SignInPage(): ReactElement {
    return (
        <HomeLayout>
            <Row style={{padding: 16}}>
                <SignInSection/>
                <Divider/>
                <VerifyYourEmailAddressSection/>
                <Divider/>
                <EmailPasswordResetCodeSection/>
                <Divider/>
                <ResetPasswordSection/>
            </Row>
        </HomeLayout>
    );
}

function SignInSection(): ReactElement {
    return (
        <Row gutter={16} justify='space-around' align='middle'>
            <Col span={12}>
                <Typography.Title level={2}>Sign In</Typography.Title>
                <SignInForm/>
            </Col>
            <Col span={7}>
                <Image preview={false} alt='Sign In' src={signInImage}/>
            </Col>
        </Row>
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
    );
}

async function signIn(data: SignInData): Promise<void> {
    let tokenSet;
    try {
        tokenSet = await queries.requestTokenSet(data);
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
    storage.saveTokenSet(tokenSet);
    location.href = '/chat';
}

interface EmailAddressVerificationData {
    readonly 'email-address': string;
    readonly 'verification-code': number;
}

function VerifyYourEmailAddressSection(): ReactElement {
    return (
        <Row gutter={16} justify='space-around' align='middle'>
            <Col span={7}>
                <Image preview={false} alt='Mail sent' src={mailSentImage}/>
            </Col>
            <Col span={12}>
                <Typography.Title level={2}>Verify Your Email Address</Typography.Title>
                <VerifyYourEmailAddressForm/>
            </Col>
        </Row>
    );
}

function VerifyYourEmailAddressForm(): ReactElement {
    const [loading, setLoading] = useState(false);
    const onFinish = async (formData: EmailAddressVerificationData) => {
        setLoading(true);
        await verifyEmailAddress(formData);
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='verify-email-address' layout='vertical'>
            <Form.Item
                name='email-address'
                label='Email address'
                rules={[{required: true, message: 'Enter your email address.'}]}
            >
                <Input type='email'/>
            </Form.Item>
            <Form.Item
                name='verification-code'
                label='Verification code'
                rules={[{required: true, message: 'Enter your verification code.'}]}
            >
                <Input type='number'/>
            </Form.Item>
            <Form.Item>
                <Button type='primary' htmlType='submit' loading={loading}>Submit</Button>
            </Form.Item>
        </Form>
    );
}

async function verifyEmailAddress(data: EmailAddressVerificationData): Promise<void> {
    try {
        const isVerified = await mutations.verifyEmailAddress(data['email-address'], data['verification-code']);
        if (isVerified) message.success('Email address verified.');
        else message.error('Incorrect verification code.');
    } catch (error) {
        if (error === CONNECTION_ERROR) await displayConnectionError();
        else if (error === UNREGISTERED_EMAIL_ADDRESS_ERROR) await displayUnregisteredEmailAddressError();
    }
}

interface PasswordResetCodeData {
    readonly 'email-address': string;
}

function EmailPasswordResetCodeSection(): ReactElement {
    return (
        <Row gutter={16} justify='space-around' align='middle'>
            <Col span={12}>
                <Typography.Title level={2}>Email Password Reset Code</Typography.Title>
                <Space direction='vertical'>
                    If you forgot your password, submit this form to receive an email containing a password reset code.
                    <EmailPasswordResetCodeForm/>
                </Space>
            </Col>
            <Col span={4}>
                <Image preview={false} alt='Forgot password' src={forgotPasswordImage}/>
            </Col>
        </Row>
    );
}

function EmailPasswordResetCodeForm(): ReactElement {
    const [loading, setLoading] = useState(false);
    const onFinish = async (formData: PasswordResetCodeData) => {
        setLoading(true);
        await emailPasswordResetCode(formData);
        setLoading(false);
    };
    return (
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
    );
}

async function emailPasswordResetCode(data: PasswordResetCodeData): Promise<void> {
    try {
        await mutations.emailPasswordResetCode(data['email-address']);
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

function ResetPasswordSection(): ReactElement {
    return (
        <Row gutter={16} justify='space-around' align='middle'>
            <Col span={9}>
                <Image preview={false} alt='Authentication' src={authenticationImage}/>
            </Col>
            <Col span={12}>
                <Typography.Title level={2}>Reset Password</Typography.Title>
                <Space direction='vertical'>
                    If you received an email with a password reset code, submit this form to reset your password.
                    <ResetPasswordForm/>
                </Space>
            </Col>
        </Row>
    );
}

function ResetPasswordForm(): ReactElement {
    const [loading, setLoading] = useState(false);
    const onFinish = async (formData: PasswordResetData) => {
        setLoading(true);
        await resetPassword(formData);
        setLoading(false);
    };
    return (
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
    )
}

async function resetPassword(data: PasswordResetData): Promise<void> {
    let isReset;
    try {
        isReset =
            await mutations.resetPassword(data['email-address'], data['password-reset-code'], data['new-password']);
    } catch (error) {
        if (error === UNREGISTERED_EMAIL_ADDRESS_ERROR) await displayUnregisteredEmailAddressError();
        else await displayConnectionError();
        return;
    }
    if (isReset) message.success('Password reset.');
    else message.error('Incorrect password reset code.');
}
