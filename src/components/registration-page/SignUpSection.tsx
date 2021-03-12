import React, {ReactElement, useState} from 'react';
import {Button, Col, Form, Image, Input, Row, Typography} from 'antd';
import completingImage from '../../images/completing.svg';
import {MutationsApiWrapper} from '../../api/MutationsApiWrapper';

export default function SignUpSection(): ReactElement {
  return (
    <Row gutter={16} justify="space-around" align="middle">
      <Col span={12}>
        <Typography.Title level={2}>Sign Up</Typography.Title>
        <SignUpForm />
      </Col>
      <Col span={12}>
        <Image preview={false} alt="Completing" src={completingImage} />
      </Col>
    </Row>
  );
}

interface SignUpFormData {
  readonly username: string;
  readonly password: string;
  readonly emailAddress: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly bio: string;
}

function SignUpForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onFinish = async (data: SignUpFormData) => {
    setLoading(true);
    await MutationsApiWrapper.createAccount({
      __typename: 'AccountInput',
      ...data,
    });
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name="signUp" layout="vertical">
      <Form.Item name="username" label="Username" rules={[{required: true, message: 'Enter a username.'}]}>
        <Input />
      </Form.Item>
      <Form.Item name="password" label="Password" rules={[{required: true, message: 'Enter a password.'}]}>
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="emailAddress"
        label="Email address"
        rules={[{required: true, message: 'Enter an email address.'}]}
      >
        <Input type="email" />
      </Form.Item>
      <Form.Item name="firstName" label="First name" initialValue="">
        <Input />
      </Form.Item>
      <Form.Item name="lastName" label="Last name" initialValue="">
        <Input />
      </Form.Item>
      <Form.Item name="bio" label="Bio" initialValue="">
        <Input.TextArea />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
