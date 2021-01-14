import React, {ReactElement, useState} from 'react';
import {Button, Col, Divider, Form, Image, Input, message, Row, Space, Typography} from 'antd';
import HomeLayout from './homeLayout';
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
import * as mutations from '../api/graphQlApi/mutations';
// @ts-ignore: Cannot find module '../../static/illustrations/completing.svg' or its corresponding type declarations.
import completingImage from '../../static/illustrations/completing.svg';
// @ts-ignore: Cannot find module '../../static/illustrations/happy_news.svg' or its corresponding type declarations.
import happyNewsImage from '../../static/illustrations/happy_news.svg';

export default function RegistrationPage(): ReactElement {
    return (
        <HomeLayout>
            <Row style={{padding: 16}}>
                <SignUpSection/>
                <Divider/>
                <ResendEmailAddressVerificationCodeSection/>
            </Row>
        </HomeLayout>
    );
}

function SignUpSection(): ReactElement {
    return (
        <Row gutter={16} justify='space-around' align='middle'>
            <Col span={12}>
                <Typography.Title level={2}>Sign Up</Typography.Title>
                <SignUpForm/>
            </Col>
            <Col span={12}>
                <Image preview={false} alt='Completing' src={completingImage}/>
            </Col>
        </Row>
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
        await createAccount(formData);
        setLoading(false);
    };
    return (
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
    );
}

async function createAccount(data: SignUpData): Promise<void> {
    try {
        await mutations.createAccount({
            username: data.username,
            password: data.password,
            emailAddress: data['email-address'],
            firstName: data['first-name'],
            lastName: data['last-name'],
            bio: data.bio,
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

function ResendEmailAddressVerificationCodeSection(): ReactElement {
    return (
        <Row gutter={16} justify='space-around' align='middle'>
            <Col span={5}>
                <Image preview={false} alt='Happy news' src={happyNewsImage}/>
            </Col>
            <Col span={12}>
                <Typography.Title level={2}>Resend Email Address Verification Code</Typography.Title>
                <Space direction='vertical'>
                    Submit this form in case you lost your verification code email.
                    <ResendEmailAddressVerificationCodeForm/>
                </Space>
            </Col>
        </Row>
    );
}

interface VerificationCodeData {
    readonly 'email-address': string;
}

function ResendEmailAddressVerificationCodeForm(): ReactElement {
    const [loading, setLoading] = useState(false);
    const onFinish = async (formData: VerificationCodeData) => {
        setLoading(true);
        await emailEmailAddressVerification(formData);
        setLoading(false);
    };
    return (
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
    );
}

async function emailEmailAddressVerification(data: VerificationCodeData): Promise<void> {
    try {
        await mutations.emailEmailAddressVerification(data['email-address']);
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
