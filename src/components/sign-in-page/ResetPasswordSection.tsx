import React, { ReactElement, useState } from 'react';
import { Button, Col, Form, Image, Input, message, Row, Space, Typography } from 'antd';
import authenticationImage from '../../images/authentication.svg';
import { isValidPasswordScalar, queryOrMutate } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../api';

export default function ResetPasswordSection(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={12}>
        <Typography.Title level={2}>Reset Password</Typography.Title>
        <Space direction='vertical'>
          If you received an email with a password reset code, submit this form to reset your password.
          <ResetPasswordForm />
        </Space>
      </Col>
      <Col span={9} pull={1}>
        <Image preview={false} alt='Authentication' src={authenticationImage} />
      </Col>
    </Row>
  );
}

interface ResetPasswordFormData {
  readonly emailAddress: string;
  readonly passwordResetCode: number;
  readonly newPassword: string;
}

function ResetPasswordForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onFinish = async (data: ResetPasswordFormData) => {
    setLoading(true);
    if (validatePassword(data.newPassword)) await operateResetPassword(data);
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name='resetPassword' layout='vertical'>
      <Form.Item
        name='emailAddress'
        label='Email address'
        rules={[{ required: true, message: 'Enter your email address.' }]}
      >
        <Input type='email' />
      </Form.Item>
      <Form.Item
        name='passwordResetCode'
        label='Password reset code'
        rules={[{ required: true, message: 'Enter the password reset code.' }]}
      >
        <Input type='number' />
      </Form.Item>
      <Form.Item name='newPassword' label='New password' rules={[{ required: true, message: 'Enter a new password.' }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button loading={isLoading} type='primary' htmlType='submit'>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

function validatePassword(password: string): boolean {
  if (!isValidPasswordScalar(password)) {
    message.error('Password must contain characters other than spaces.', 5);
    return false;
  }
  return true;
}

async function operateResetPassword(data: ResetPasswordFormData): Promise<void> {
  const response = await resetPassword(data);
  if (response?.resetPassword === null) message.success('Password reset.', 3);
  else if (response?.resetPassword?.__typename === 'UnregisteredEmailAddress')
    message.error("That email address isn't registered.", 5);
  else if (response?.resetPassword?.__typename === 'InvalidPasswordResetCode')
    message.error('Incorrect reset code.', 3);
}

interface ResetPasswordResult {
  readonly resetPassword: InvalidPasswordResetCode | UnregisteredEmailAddress | null;
}

interface InvalidPasswordResetCode {
  readonly __typename: 'InvalidPasswordResetCode';
}

interface UnregisteredEmailAddress {
  readonly __typename: 'UnregisteredEmailAddress';
}

async function resetPassword({
  emailAddress,
  passwordResetCode,
  newPassword,
}: ResetPasswordFormData): Promise<ResetPasswordResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(httpApiConfig, {
        query: `
          mutation ResetPassword($emailAddress: String!, $passwordResetCode: Int!, $newPassword: Password!) {
            resetPassword(
              emailAddress: $emailAddress
              passwordResetCode: $passwordResetCode
              newPassword: $newPassword
            ) {
              __typename
            }
          }
        `,
        variables: { emailAddress, passwordResetCode, newPassword },
      }),
  );
}
