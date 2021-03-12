import React, { ReactElement, useState } from 'react';
import { Button, Col, Form, Image, Input, Row, Space, Typography } from 'antd';
import happyNewsImage from '../../images/happy-news.svg';
import { MutationsApiWrapper } from '../../api/MutationsApiWrapper';

export default function ResendEmailAddressVerificationCodeSection(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={5}>
        <Image preview={false} alt='Happy news' src={happyNewsImage} />
      </Col>
      <Col span={12}>
        <Typography.Title level={2}>Resend Email Address Verification Code</Typography.Title>
        <Space direction='vertical'>
          Submit this form in case you lost your verification code email.
          <ResendEmailAddressVerificationCodeForm />
        </Space>
      </Col>
    </Row>
  );
}

interface ResendEmailAddressVerificationCodeFormData {
  readonly emailAddress: string;
}

function ResendEmailAddressVerificationCodeForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onFinish = async ({ emailAddress }: ResendEmailAddressVerificationCodeFormData) => {
    setLoading(true);
    await MutationsApiWrapper.emailEmailAddressVerification(emailAddress);
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name='resendVerificationCode' layout='vertical'>
      <Form.Item
        name='emailAddress'
        label='Email address'
        rules={[{ required: true, message: 'Enter your email address.' }]}
      >
        <Input type='email' />
      </Form.Item>
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
