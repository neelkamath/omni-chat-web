import React, { ReactElement, useState } from 'react';
import { Button, Col, Form, Image, Input, message, Row, Space, Typography } from 'antd';
import forgotPasswordImage from '../../images/forgot-password.svg';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { queryOrMutate } from '@neelkamath/omni-chat';

export default function EmailPasswordResetCodeSection(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={12} pull={1}>
        <Typography.Title level={2}>Email Password Reset Code</Typography.Title>
        <Space direction='vertical'>
          If you forgot your password, submit this form to receive an email containing a password reset code.
          <EmailPasswordResetCodeForm />
        </Space>
      </Col>
      <Col span={4} pull={2}>
        <Image preview={false} alt='Forgot password' src={forgotPasswordImage} />
      </Col>
    </Row>
  );
}

interface EmailPasswordResetCodeForm {
  readonly emailAddress: string;
}

function EmailPasswordResetCodeForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onFinish = async ({ emailAddress }: EmailPasswordResetCodeForm) => {
    setLoading(true);
    await operateEmailPasswordResetCode(emailAddress);
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name='emailPasswordResetCode' layout='vertical'>
      <Form.Item
        name='emailAddress'
        label='Email address'
        rules={[{ required: true, message: 'Enter your email address.' }]}
      >
        <Input type='email' />
      </Form.Item>
      <Form.Item>
        <Button loading={isLoading} type='primary' htmlType='submit'>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

async function operateEmailPasswordResetCode(emailAddress: string): Promise<void> {
  const result = await emailPasswordResetCode(emailAddress);
  if (result?.emailPasswordResetCode === null) message.success('Password reset code sent to your email.', 5);
  else if (result?.emailPasswordResetCode?.__typename === 'UnregisteredEmailAddress')
    message.error('That email address isn\'t registered.', 5);
}

interface EmailPasswordResetCodeResult {
  readonly emailPasswordResetCode: UnregisteredEmailAddress | null;
}

interface UnregisteredEmailAddress {
  readonly __typename: 'UnregisteredEmailAddress';
}

async function emailPasswordResetCode(emailAddress: string): Promise<EmailPasswordResetCodeResult | undefined> {
  return operateGraphQlApi(
    async () =>
      await queryOrMutate(httpApiConfig, {
        query: `
          mutation EmailPasswordResetCode($emailAddress: String!) {
            emailPasswordResetCode(emailAddress: $emailAddress) {
              __typename
            }
          }
        `,
        variables: { emailAddress },
      }),
  );
}
