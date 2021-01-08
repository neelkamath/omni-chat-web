import React, {ReactElement, useState} from 'react';
import {Button, Divider, Form, Input, message, Space, Typography} from 'antd';
import HomeLayout from './homeLayout';
import {createAccount, emailEmailAddressVerification, verifyEmailAddress} from '../api/operations';
import {
    CONNECTION_ERROR,
    displayConnectionError,
    displayEmailAddressTakenError,
    displayEmailAddressVerifiedError,
    displayInvalidDomainError,
    displayUnregisteredEmailAddressError,
    displayUsernameTakenError,
    EMAIL_ADDRESS_TAKEN_ERROR,
    EMAIL_ADDRESS_VERIFIED_ERROR,
    INVALID_DOMAIN_ERROR,
    UNREGISTERED_EMAIL_ADDRESS_ERROR,
    USERNAME_TAKEN_ERROR
} from '../api/errors';

export default function RegistrationPage(): ReactElement {
    return (
        <HomeLayout>
            <SignUpForm/>
            <Divider/>
            <ResendVerificationCodeForm/>
            <Divider/>
            <EmailAddressVerificationForm/>
        </HomeLayout>
    );
}

interface SignUpData {
    readonly username: string;
    readonly password: string;
    readonly 'email-address': string;
    readonly 'first-name'?: string;
    readonly 'last-name'?: string;
    readonly 'bio'?: string;
}

function SignUpForm(): ReactElement {
    const [loading, setLoading] = useState(false);
    const onFinish = async (formData: SignUpData) => {
        setLoading(true);
        await signUp(formData);
        setLoading(false);
    };
    return (
        <>
            <Typography.Title level={2}>Sign Up</Typography.Title>
            <Form onFinish={onFinish} name='sign-up' layout='vertical'>
                <Form.Item name='username' label='Username' rules={[{required: true, message: 'Enter a username.'}]}>
                    <Input/>
                </Form.Item>
                <Form.Item name='password' label='Password' rules={[{required: true, message: 'Enter a password.'}]}>
                    <Input.Password/>
                </Form.Item>
                <Form.Item
                    name='email-address'
                    label='Email address'
                    rules={[{required: true, message: 'Enter an email address.'}]}
                >
                    <Input type='email'/>
                </Form.Item>
                <Form.Item name='first-name' label='First name' initialValue=''>
                    <Input/>
                </Form.Item>
                <Form.Item name='last-name' label='Last name' initialValue=''>
                    <Input/>
                </Form.Item>
                <Form.Item name='bio' label='Bio' initialValue=''>
                    <Input.TextArea/>
                </Form.Item>
                <Form.Item>
                    <Button type='primary' htmlType='submit' loading={loading}>Submit</Button>
                </Form.Item>
            </Form>
        </>
    );
}

async function signUp(data: SignUpData): Promise<void> {
    try {
        await createAccount({
            username: data['username'],
            password: data['password'],
            emailAddress: data['email-address'],
            firstName: data['first-name'],
            lastName: data['last-name'],
            bio: data['bio'],
        });
    } catch (error) {
        switch (error) {
            case CONNECTION_ERROR:
                await displayConnectionError();
                break;
            case USERNAME_TAKEN_ERROR:
                await displayUsernameTakenError();
                break;
            case EMAIL_ADDRESS_TAKEN_ERROR:
                await displayEmailAddressTakenError();
                break;
            case INVALID_DOMAIN_ERROR:
                await displayInvalidDomainError();
        }
        return;
    }
    message.success('Account created. Check your email for an account verification code.', 5);
}

interface VerificationCodeData {
    readonly 'email-address': string;
}

function ResendVerificationCodeForm(): ReactElement {
    const [loading, setLoading] = useState(false);
    const onFinish = async (formData: VerificationCodeData) => {
        setLoading(true);
        await resendVerificationCode(formData);
        setLoading(false);
    };
    return (
        <>
            <Typography.Title level={2}>Resend Email Address Verification Code</Typography.Title>
            <Space direction='vertical'>
                <Typography.Text>Submit this form in case you lost your verification code email.</Typography.Text>
                <Form onFinish={onFinish} name='resend-verification-code' layout='vertical'>
                    <Form.Item
                        name='email-address'
                        label='Email address'
                        rules={[{required: true, message: 'Enter your email address.'}]}
                    >
                        <Input type='email'/>
                    </Form.Item>
                    <Form.Item>
                        <Button type='primary' htmlType='submit' loading={loading}>Submit</Button>
                    </Form.Item>
                </Form>
            </Space>
        </>
    );
}

async function resendVerificationCode(data: VerificationCodeData): Promise<void> {
    try {
        await emailEmailAddressVerification(data['email-address']);
    } catch (error) {
        switch (error) {
            case CONNECTION_ERROR:
                await displayConnectionError();
                break;
            case UNREGISTERED_EMAIL_ADDRESS_ERROR:
                await displayUnregisteredEmailAddressError();
                break;
            case EMAIL_ADDRESS_VERIFIED_ERROR:
                await displayEmailAddressVerifiedError();
                break;
        }
        return;
    }
    message.success('Resent verification code.');
}

interface EmailAddressVerificationData {
    readonly 'email-address': string;
    readonly 'verification-code': number;
}

function EmailAddressVerificationForm(): ReactElement {
    const [loading, setLoading] = useState(false);
    const onFinish = async (formData: EmailAddressVerificationData) => {
        setLoading(true);
        await verifyAddressWithCode(formData);
        setLoading(false);
    };
    return (
        <>
            <Typography.Title level={2}>Verify Your Email Address</Typography.Title>
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
        </>
    );
}

async function verifyAddressWithCode(data: EmailAddressVerificationData): Promise<void> {
    try {
        const isVerified = await verifyEmailAddress(data['email-address'], data['verification-code']);
        if (isVerified) message.success('Email address verified.'); else message.error('Incorrect verification code.');
    } catch (error) {
        if (error === CONNECTION_ERROR) await displayConnectionError();
        else if (error === UNREGISTERED_EMAIL_ADDRESS_ERROR) await displayUnregisteredEmailAddressError();
    }
}
