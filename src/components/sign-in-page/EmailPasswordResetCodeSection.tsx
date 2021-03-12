import React, {ReactElement, useState} from 'react';
import {Button, Col, Form, Image, Input, Row, Space, Typography} from 'antd';
import forgotPasswordImage from '../../images/forgot-password.svg';
import {MutationsApiWrapper} from '../../api/MutationsApiWrapper';

export default function EmailPasswordResetCodeSection(): ReactElement {
  return (
    <Row gutter={16} justify="space-around" align="middle">
      <Col span={12}>
        <Typography.Title level={2}>Email Password Reset Code</Typography.Title>
        <Space direction="vertical">
          If you forgot your password, submit this form to receive an email containing a password reset code.
          <EmailPasswordResetCodeForm />
        </Space>
      </Col>
      <Col span={4}>
        <Image preview={false} alt="Forgot password" src={forgotPasswordImage} />
      </Col>
    </Row>
  );
}

interface EmailPasswordResetCodeForm {
  readonly emailAddress: string;
}

function EmailPasswordResetCodeForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onFinish = async ({emailAddress}: EmailPasswordResetCodeForm) => {
    setLoading(true);
    await MutationsApiWrapper.emailPasswordResetCode(emailAddress);
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name="emailPasswordResetCode" layout="vertical">
      <Form.Item
        name="emailAddress"
        label="Email address"
        rules={[{required: true, message: 'Enter your email address.'}]}
      >
        <Input type="email" />
      </Form.Item>
      <Form.Item>
        <Button loading={isLoading} type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
