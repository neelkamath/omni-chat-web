import React, { ReactElement, useState } from 'react';
import { Button, Col, Form, Image, Input, message, Row, Typography } from 'antd';
import completingImage from '../../images/completing.svg';
import {
  AccountInput,
  createAccount,
  isValidNameScalar,
  isValidPasswordScalar,
  isValidUsernameScalar,
  Name,
} from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../api';

export default function SignUpSection(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={11}>
        <Typography.Title level={2}>Sign Up</Typography.Title>
        <SignUpForm />
      </Col>
      <Col span={11}>
        <Image preview={false} alt='Completing' src={completingImage} />
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

// TODO: State that the bio uses CommonMark. Display it as such as well.
function SignUpForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onFinish = async (data: SignUpFormData) => {
    setLoading(true);
    const input = buildAccountInput(data);
    if (validateAccountInput(input)) await operateCreateAccount(input);
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name='signUp' layout='vertical'>
      <Form.Item name='username' label='Username' rules={[{ required: true, message: 'Enter a username.' }]}>
        <Input maxLength={30} />
      </Form.Item>
      <Form.Item name='password' label='Password' rules={[{ required: true, message: 'Enter a password.' }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item
        name='emailAddress'
        label='Email address'
        rules={[{ required: true, message: 'Enter an email address.' }]}
      >
        <Input type='email' />
      </Form.Item>
      <Form.Item name='firstName' label='First name' initialValue=''>
        <Input maxLength={30} />
      </Form.Item>
      <Form.Item name='lastName' label='Last name' initialValue=''>
        <Input maxLength={30} />
      </Form.Item>
      <Form.Item name='bio' label='Bio' initialValue=''>
        <Input.TextArea maxLength={2500} />
      </Form.Item>
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

function buildAccountInput(data: SignUpFormData): AccountInput {
  return {
    __typename: 'AccountInput',
    username: data.username.trim(),
    password: data.password,
    emailAddress: data.emailAddress,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    bio: data.bio.trim(),
  };
}

function validateAccountInput({ username, password, firstName, lastName }: AccountInput): boolean {
  if (!isValidUsernameScalar(username)) {
    message.error('Username must be lowercase and not contain spaces.', 5);
    return false;
  }
  if (!isValidPasswordScalar(password)) {
    message.error('Password must contain characters other than spaces.', 5);
    return false;
  }
  const isInvalidName = (name: Name | null) => name !== null && !isValidNameScalar(name);
  if (isInvalidName(firstName) || isInvalidName(lastName)) {
    message.error('Names mustn\'t contain spaces.', 5);
    return false;
  }
  return true;
}

async function operateCreateAccount(input: AccountInput): Promise<void> {
  const result = await operateGraphQlApi(() => createAccount(httpApiConfig, input));
  if (result?.createAccount === null)
    message.success('Account created. Check your email for an account verification code.', 5);
  switch (result?.createAccount?.__typename) {
    case 'EmailAddressTaken':
      message.error('That email address has already been registered.', 5);
      break;
    case 'InvalidDomain':
      message.error(
        'This Omni Chat server disallows the provided email address\'s domain. For example, ' +
        '"john.doe@private.company.com" may be allowed but not "john.doe@gmail.com".',
        10,
      );
      break;
    case 'UsernameTaken':
      message.error('That username has already been taken.', 5);
  }
}
