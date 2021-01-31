import React, {ReactElement, useState} from 'react';
import {Button, Col, Divider, Form, Image, Input, Row, Space, Typography} from 'antd';
import HomeLayout from './HomeLayout';
import happyNewsImage from '../images/happy-news.svg';
import * as mutationsApi from '../api/wrappers/mutationsApi';
import completingImage from '../images/completing.svg';

export default function RegistrationPage(): ReactElement {
    return (
        <HomeLayout>
            <Row gutter={16} style={{padding: 16}}>
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

function SignUpForm(): ReactElement {
    const [isLoading, setLoading] = useState(false);
    const onFinish = async (data: any) => {
        setLoading(true);
        await mutationsApi.createAccount(data);
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='signUp' layout='vertical'>
            <Form.Item name='username' label='Username' rules={[{required: true, message: 'Enter a username.'}]}>
                <Input/>
            </Form.Item>
            <Form.Item name='password' label='Password' rules={[{required: true, message: 'Enter a password.'}]}>
                <Input.Password/>
            </Form.Item>
            <Form.Item
                name='emailAddress'
                label='Email address'
                rules={[{required: true, message: 'Enter an email address.'}]}
            >
                <Input type='email'/>
            </Form.Item>
            <Form.Item name='firstName' label='First name' initialValue=''>
                <Input/>
            </Form.Item>
            <Form.Item name='lastName' label='Last name' initialValue=''>
                <Input/>
            </Form.Item>
            <Form.Item name='bio' label='Bio' initialValue=''>
                <Input.TextArea/>
            </Form.Item>
            <Form.Item>
                <Button type='primary' htmlType='submit' loading={isLoading}>Submit</Button>
            </Form.Item>
        </Form>
    );
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

function ResendEmailAddressVerificationCodeForm(): ReactElement {
    const [isLoading, setLoading] = useState(false);
    const onFinish = async (data: any) => {
        setLoading(true);
        await mutationsApi.emailEmailAddressVerification(data.emailAddress);
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='resendVerificationCode' layout='vertical'>
            <Form.Item
                name='emailAddress'
                label='Email address'
                rules={[{required: true, message: 'Enter your email address.'}]}
            >
                <Input type='email'/>
            </Form.Item>
            <Form.Item>
                <Button type='primary' htmlType='submit' loading={isLoading}>Submit</Button>
            </Form.Item>
        </Form>
    );
}
