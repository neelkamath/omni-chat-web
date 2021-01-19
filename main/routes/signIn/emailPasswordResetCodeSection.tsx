import React, {ReactElement, useState} from 'react';
import {Button, Col, Form, Image, Input, message, Row, Space, Typography} from 'antd';
import forgotPasswordImage from '../../static/illustrations/forgot_password.svg';
import {Mutations} from '../../api/graphQlApi/mutations';
import {ConnectionError, InternalServerError, UnregisteredEmailAddressError,} from '../../api/errors';

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
        await Mutations.emailPasswordResetCode(data['email-address']);
    } catch (error) {
        if (error instanceof UnregisteredEmailAddressError) await UnregisteredEmailAddressError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    message.success('Password reset code sent to your email.');
}
