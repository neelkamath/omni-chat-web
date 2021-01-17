import React, {ReactElement, useState} from 'react';
import {Button, Col, Form, Image, Input, message, Row, Space, Typography} from 'antd';
import happyNewsImage from '../../static/illustrations/happy_news.svg';
import * as mutations from '../../api/graphQlApi/mutations';
import {
    CONNECTION_ERROR,
    displayConnectionError,
    displayEmailAddressVerifiedError,
    displayUnregisteredEmailAddressError,
    EMAIL_ADDRESS_VERIFIED_ERROR,
    UNREGISTERED_EMAIL_ADDRESS_ERROR
} from '../../api/errors';

export default function ResendEmailAddressVerificationCodeSection(): ReactElement {
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
