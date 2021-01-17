import React, {ReactElement, useState} from 'react';
import {Button, Col, Form, Image, Input, message, Row, Space, Typography} from 'antd';
import forgotPasswordImage from '../../static/illustrations/forgot_password.svg';
import * as mutations from '../../api/graphQlApi/mutations';
import {
    CONNECTION_ERROR,
    displayConnectionError,
    displayUnregisteredEmailAddressError,
    UNREGISTERED_EMAIL_ADDRESS_ERROR
} from '../../api/errors';

export default function EmailPasswordResetCodeSection(): ReactElement {
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

interface PasswordResetCodeData {
    readonly 'email-address': string;
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
