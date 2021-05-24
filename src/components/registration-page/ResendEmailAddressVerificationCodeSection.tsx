import React, { ReactElement, useState } from 'react';
import { Button, Col, Form, Image, Input, message, Row, Space, Typography } from 'antd';
import happyNewsImage from '../../images/happy-news.svg';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { queryOrMutate } from '@neelkamath/omni-chat';

export default function ResendEmailAddressVerificationCodeSection(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={5} push={2}>
        <Image preview={false} alt='Happy news' src={happyNewsImage} />
      </Col>
      <Col span={12} push={2}>
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
    await operateEmailEmailAddressVerification(emailAddress);
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

async function operateEmailEmailAddressVerification(emailAddress: string): Promise<void> {
  const result = await emailEmailAddressVerification(emailAddress);
  if (result?.emailEmailAddressVerification === null) message.success('Resent verification code.', 3);
  else if (result?.emailEmailAddressVerification?.__typename === 'EmailAddressVerified')
    message.warn('The account has already been verified.', 5);
  else if (result?.emailEmailAddressVerification?.__typename === 'UnregisteredEmailAddress')
    message.error('There\'s no account associated with that email address.', 5);
}

interface EmailEmailAddressVerificationResult {
  readonly emailEmailAddressVerification: UnregisteredEmailAddress | EmailAddressVerified | null;
}

interface UnregisteredEmailAddress {
  readonly __typename: 'UnregisteredEmailAddress';
}

interface EmailAddressVerified {
  readonly __typename: 'EmailAddressVerified';
}

async function emailEmailAddressVerification(
  emailAddress: string,
): Promise<EmailEmailAddressVerificationResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(httpApiConfig, {
        query: `
          mutation EmailEmailAddressVerification($emailAddress: String!) {
            emailEmailAddressVerification(emailAddress: $emailEmailAddressVerification) {
              __typename
            }
          }
        `,
        variables: { emailAddress },
      }),
  );
}
