import React, { ReactElement, useState } from 'react';
import { Button, Col, Form, Image, Input, message, Row, Typography } from 'antd';
import mailSentImage from '../../images/mail-sent.svg';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { queryOrMutate } from '@neelkamath/omni-chat';

export default function VerifyYourEmailAddressSection(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={7} push={5}>
        <Image preview={false} alt='Mail sent' src={mailSentImage} />
      </Col>
      <Col span={12} push={8}>
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
  const onFinish = async (data: VerifyYourEmailAddressFormData) => {
    setLoading(true);
    await operateVerifyEmailAddress(data);
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

async function operateVerifyEmailAddress(data: VerifyYourEmailAddressFormData): Promise<void> {
  const response = await verifyEmailAddress(data);
  if (response?.verifyEmailAddress === null) message.success('Email address verified.', 3);
  else if (response?.verifyEmailAddress?.__typename === 'UnregisteredEmailAddress')
    message.error('That email address isn\'t registered.', 5);
  else if (response?.verifyEmailAddress?.__typename === 'InvalidVerificationCode')
    message.error('Incorrect verification code.', 3);
}

interface VerifyEmailAddressResult {
  readonly verifyEmailAddress: InvalidVerificationCode | UnregisteredEmailAddress | null;
}

interface InvalidVerificationCode {
  readonly __typename: 'InvalidVerificationCode';
}

interface UnregisteredEmailAddress {
  readonly __typename: 'UnregisteredEmailAddress';
}

async function verifyEmailAddress({
                                    emailAddress,
                                    verificationCode,
                                  }: VerifyYourEmailAddressFormData): Promise<VerifyEmailAddressResult | undefined> {
  return await operateGraphQlApi(async () =>
    queryOrMutate(httpApiConfig, {
      query: `
        mutation VerifyEmailAddress($emailAddress: String!, $verificationCode: Int!) {
          verifyEmailAddress(emailAddress: $emailAddress, verificationCode: $verificationCode) {
            __typename
          }
        }
      `,
      variables: { emailAddress, verificationCode },
    }),
  );
}
