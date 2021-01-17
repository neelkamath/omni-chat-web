import React, {ReactElement, useState} from 'react';
import {Button, Col, Form, Image, Input, message, Row, Space, Typography} from 'antd';
import authenticationImage from '../../static/illustrations/authentication.svg';
import * as mutations from '../../api/graphQlApi/mutations';
import {
    displayConnectionError,
    displayUnregisteredEmailAddressError,
    UNREGISTERED_EMAIL_ADDRESS_ERROR
} from '../../api/errors';

export default function ResetPasswordSection(): ReactElement {
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

interface PasswordResetData {
    readonly 'email-address': string;
    readonly 'password-reset-code': number;
    readonly 'new-password': string;
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
