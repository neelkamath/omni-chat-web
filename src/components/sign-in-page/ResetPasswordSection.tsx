import React, {ReactElement, useState} from 'react';
import {Button, Col, Form, Image, Input, Row, Space, Typography} from 'antd';
import authenticationImage from '../../images/authentication.svg';
import {MutationsApiWrapper} from '../../api/MutationsApiWrapper';

export default function ResetPasswordSection(): ReactElement {
  return (
    <Row gutter={16} justify="space-around" align="middle">
      <Col span={9}>
        <Image preview={false} alt="Authentication" src={authenticationImage} />
      </Col>
      <Col span={12}>
        <Typography.Title level={2}>Reset Password</Typography.Title>
        <Space direction="vertical">
          If you received an email with a password reset code, submit this form to reset your password.
          <ResetPasswordForm />
        </Space>
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
  const onFinish = async ({emailAddress, passwordResetCode, newPassword}: ResetPasswordFormData) => {
    setLoading(true);
    await MutationsApiWrapper.resetPassword(emailAddress, passwordResetCode, newPassword);
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name="resetPassword" layout="vertical">
      <Form.Item
        name="emailAddress"
        label="Email address"
        rules={[{required: true, message: 'Enter your email address.'}]}
      >
        <Input type="email" />
      </Form.Item>
      <Form.Item
        name="passwordResetCode"
        label="Password reset code"
        rules={[{required: true, message: 'Enter the password reset code.'}]}
      >
        <Input type="number" />
      </Form.Item>
      <Form.Item name="newPassword" label="New password" rules={[{required: true, message: 'Enter a new password.'}]}>
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button loading={isLoading} type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
