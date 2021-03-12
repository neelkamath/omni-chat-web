import React, { ReactElement, useState } from 'react';
import { Button, Col, Form, Image, Input, Row, Typography } from 'antd';
import mailSentImage from '../../images/mail-sent.svg';
import { MutationsApiWrapper } from '../../api/MutationsApiWrapper';

export default function VerifyYourEmailAddressSection(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={7}>
        <Image preview={false} alt='Mail sent' src={mailSentImage} />
      </Col>
      <Col span={12}>
        <Typography.Title level={2}>Verify Your Email Address</Typography.Title>
        <VerifyYourEmailAddressForm />
      </Col>
    </Row>
  );
}

interface VerifyYourEmailAddressFormData {
  readonly emailAddress: string;
  readonly verificationCode: number;
}

function VerifyYourEmailAddressForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onFinish = async ({ emailAddress, verificationCode }: VerifyYourEmailAddressFormData) => {
    setLoading(true);
    await MutationsApiWrapper.verifyEmailAddress(emailAddress, verificationCode);
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name='verifyEmailAddress' layout='vertical'>
      <Form.Item
        name='emailAddress'
        label='Email address'
        rules={[{ required: true, message: 'Enter your email address.' }]}
      >
        <Input type='email' />
      </Form.Item>
      <Form.Item
        name='verificationCode'
        label='Verification code'
        rules={[{ required: true, message: 'Enter your verification code.' }]}
      >
        <Input type='number' />
      </Form.Item>
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
