import React, {ReactElement, useState} from 'react';
import {Button, Col, Form, Image, Input, message, Row, Typography} from 'antd';
import mailSentImage from '../../static/illustrations/mail_sent.svg';
import {Mutations} from '../../api/graphQlApi/mutations';
import {ConnectionError, InternalServerError, UnregisteredEmailAddressError,} from '../../api/errors';

export default function VerifyYourEmailAddressSection(): ReactElement {
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

interface EmailAddressVerificationData {
    readonly 'email-address': string;
    readonly 'verification-code': number;
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
    let isVerified;
    try {
        isVerified = await Mutations.verifyEmailAddress(data['email-address'], data['verification-code']);
    } catch (error) {
        if (error instanceof UnregisteredEmailAddressError) await UnregisteredEmailAddressError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    isVerified ? message.success('Email address verified.') : message.error('Incorrect verification code.');
}
