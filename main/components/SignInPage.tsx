import React, {ReactElement, useState} from 'react';
import HomeLayout from './HomeLayout';
import {Button, Col, Divider, Form, Image, Input, Row, Space, Typography} from 'antd';
import signInImage from '../images/sign-in.svg';
import * as queriesApi from '../api/wrappers/queriesApi';
import mailSentImage from '../images/mail-sent.svg';
import * as mutationsApi from '../api/wrappers/mutationsApi';
import forgotPasswordImage from '../images/forgot-password.svg';
import authenticationImage from '../images/authentication.svg';

export default function SignInPage(): ReactElement {
    return (
        <HomeLayout>
            <Row gutter={16} style={{padding: 16}}>
                <Row>
                    <SignInSection/>
                    <Divider/>
                    <VerifyYourEmailAddressSection/>
                    <Divider/>
                    <EmailPasswordResetCodeSection/>
                    <Divider/>
                    <ResetPasswordSection/>
                </Row>
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

function SignInForm(): ReactElement {
    const [isLoading, setLoading] = useState(false);
    const onFinish = async (data: any) => {
        setLoading(true);
        await queriesApi.requestTokenSet(data);
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='signIn' layout='vertical'>
            <Form.Item name='username' label='Username' rules={[{required: true, message: 'Enter your username.'}]}>
                <Input/>
            </Form.Item>
            <Form.Item name='password' label='Password' rules={[{required: true, message: 'Enter your password.'}]}>
                <Input.Password/>
            </Form.Item>
            <Form.Item>
                <Button type='primary' htmlType='submit' loading={isLoading}>Submit</Button>
            </Form.Item>
        </Form>
    );
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
    const [isLoading, setLoading] = useState(false);
    const onFinish = async (data: any) => {
        setLoading(true);
        await mutationsApi.verifyEmailAddress(data.emailAddress, data.verificationCode);
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='verifyEmailAddress' layout='vertical'>
            <Form.Item
                name='emailAddress'
                label='Email address'
                rules={[{required: true, message: 'Enter your email address.'}]}
            >
                <Input type='email'/>
            </Form.Item>
            <Form.Item
                name='verificationCode'
                label='Verification code'
                rules={[{required: true, message: 'Enter your verification code.'}]}
            >
                <Input type='number'/>
            </Form.Item>
            <Form.Item>
                <Button type='primary' htmlType='submit' loading={isLoading}>Submit</Button>
            </Form.Item>
        </Form>
    );
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
    const [isLoading, setLoading] = useState(false);
    const onFinish = async (data: any) => {
        setLoading(true);
        await mutationsApi.emailPasswordResetCode(data.emailAddress);
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='emailPasswordResetCode' layout='vertical'>
            <Form.Item
                name='emailAddress'
                label='Email address'
                rules={[{required: true, message: 'Enter your email address.'}]}
            >
                <Input type='email'/>
            </Form.Item>
            <Form.Item>
                <Button loading={isLoading} type='primary' htmlType='submit'>Submit</Button>
            </Form.Item>
        </Form>
    );
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
    const [isLoading, setLoading] = useState(false);
    const onFinish = async (data: any) => {
        setLoading(true);
        await mutationsApi.resetPassword(data.emailAddress, data.passwordResetCode, data.newPassword);
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='resetPassword' layout='vertical'>
            <Form.Item
                name='emailAddress'
                label='Email address'
                rules={[{required: true, message: 'Enter your email address.'}]}
            >
                <Input type='email'/>
            </Form.Item>
            <Form.Item
                name='passwordResetCode'
                label='Password reset code'
                rules={[{required: true, message: 'Enter the password reset code.'}]}
            >
                <Input type='number'/>
            </Form.Item>
            <Form.Item
                name='newPassword'
                label='New password'
                rules={[{required: true, message: 'Enter a new password.'}]}
            >
                <Input.Password/>
            </Form.Item>
            <Form.Item>
                <Button loading={isLoading} type='primary' htmlType='submit'>Submit</Button>
            </Form.Item>
        </Form>
    )
}
