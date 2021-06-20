import React, { ReactElement, useState } from 'react';
import { Button, Col, Form, Image, Input, message, Row, Typography } from 'antd';
import signInImage from '../../images/sign-in.svg';
import { Storage } from '../../Storage';
import {
  Id,
  isValidPasswordScalar,
  isValidUsernameScalar,
  Password,
  queryOrMutate,
  Username,
} from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../api';

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
    if (validateLogin(data)) await operateRequestTokenSet(data);
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name='signIn' layout='vertical'>
      <Form.Item name='username' label='Username' rules={[{ required: true, message: 'Enter your username.' }]}>
        <Input maxLength={30} />
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

interface Login {
  readonly username: Username;
  readonly password: Password;
}

function validateLogin({ username, password }: Login): boolean {
  if (!isValidUsernameScalar(username)) {
    message.error('That username doesn\'t exist.', 5);
    return false;
  }
  if (!isValidPasswordScalar(password)) {
    message.error('Incorrect password.', 3);
    return false;
  }
  return true;
}

async function operateRequestTokenSet(login: Login): Promise<void> {
  const response = await requestTokenSet(login);
  switch (response?.requestTokenSet.__typename) {
    case 'IncorrectPassword':
      message.error('Incorrect password.', 3);
      break;
    case 'NonexistingUser':
      message.error('That username doesn\'t exist.', 5);
      break;
    case 'TokenSet':
      Storage.saveTokenSet(response.requestTokenSet);
      location.href = '/chat';
      break;
    case 'UnverifiedEmailAddress':
      message.error('You must first verify your email address.', 5);
  }
}

interface RequestTokenSetResult {
  readonly requestTokenSet: TokenSet | NonexistingUser | UnverifiedEmailAddress | IncorrectPassword;
}

interface TokenSet {
  readonly __typename: 'TokenSet';
  readonly accessToken: Id;
  readonly refreshToken: Id;
}

interface NonexistingUser {
  readonly __typename: 'NonexistingUser';
}

interface UnverifiedEmailAddress {
  readonly __typename: 'UnverifiedEmailAddress';
}

interface IncorrectPassword {
  readonly __typename: 'IncorrectPassword';
}

async function requestTokenSet(login: Login): Promise<RequestTokenSetResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(httpApiConfig, {
        query: `
          query RequestTokenSet($login: Login!) {
            requestTokenSet(login: $login) {
              __typename
              ... on TokenSet {
                accessToken
                refreshToken
              }
            }
          }
        `,
        variables: { login },
      }),
  );
}
