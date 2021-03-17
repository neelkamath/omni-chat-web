import React, { ReactElement, useState } from 'react';
import { Button, Col, Form, Image, Input, Row, Typography } from 'antd';
import signInImage from '../../images/sign-in.svg';
import { QueriesApiWrapper } from '../../api/QueriesApiWrapper';

export default function SignInSection(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={12}>
        <Typography.Title level={2}>Sign In</Typography.Title>
        <SignInForm />
      </Col>
      <Col span={7} push={1}>
        <Image preview={false} alt='Sign In' src={signInImage} />
      </Col>
    </Row>
  );
}

interface SignInFormData {
  readonly username: string;
  readonly password: string;
}

function SignInForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onFinish = async (data: SignInFormData) => {
    setLoading(true);
    await QueriesApiWrapper.requestTokenSet({ __typename: 'Login', ...data });
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name='signIn' layout='vertical'>
      <Form.Item name='username' label='Username' rules={[{ required: true, message: 'Enter your username.' }]}>
        <Input />
      </Form.Item>
      <Form.Item name='password' label='Password' rules={[{ required: true, message: 'Enter your password.' }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
