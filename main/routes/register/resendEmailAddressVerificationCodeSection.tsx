import React, {ReactElement, useState} from 'react';
import {Button, Col, Form, Image, Input, message, Row, Space, Typography} from 'antd';
import happyNewsImage from '../../static/illustrations/happy_news.svg';
import {Mutations} from '../../api/graphQlApi/mutations';
import {
    ConnectionError,
    EmailAddressVerifiedError,
    InternalServerError,
    UnregisteredEmailAddressError,
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
        await Mutations.emailEmailAddressVerification(data['email-address']);
    } catch (error) {
        if (error instanceof UnregisteredEmailAddressError) await UnregisteredEmailAddressError.display();
        else if (error instanceof EmailAddressVerifiedError) await EmailAddressVerifiedError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    message.success('Resent verification code.');
}
