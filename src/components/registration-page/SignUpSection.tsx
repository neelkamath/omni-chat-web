import React, { ReactElement, useEffect, useState } from 'react';
import { Button, Col, Form, Image, Input, message, Row, Space, Spin, Typography } from 'antd';
import completingImage from '../../images/completing.svg';
import {
  Bio,
  isValidPasswordScalar,
  isValidUsernameScalar,
  Name,
  Password,
  queryOrMutate,
  Username,
} from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../api';

export default function SignUpSection(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={11}>
        <Typography.Title level={2}>Sign Up</Typography.Title>
        <Space direction='vertical'>
          You can edit your username, profile picture, etc. once you&apos;ve signed in.
          <AllowedDomains />
          <SignUpForm />
        </Space>
      </Col>
      <Col span={11}>
        <Image preview={false} alt='Completing' src={completingImage} />
      </Col>
    </Row>
  );
}

function AllowedDomains(): ReactElement {
  const [section, setSection] = useState(<Spin size='small' />);
  useEffect(() => {
    readAllowedEmailAddressDomains().then((response) => {
      if (response === undefined || response.readAllowedEmailAddressDomains.length === 0) return;
      setSection(
        <>
          This Omni Chat server only allows registering with the following email address domains:{' '}
          <Typography.Text strong>{response.readAllowedEmailAddressDomains.join(', ')}</Typography.Text>
        </>,
      );
    });
  }, []);
  return section;
}

interface SignUpFormData {
  readonly username: string;
  readonly password: string;
  readonly emailAddress: string;
}

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
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

interface AccountInput {
  readonly username: Username;
  readonly password: Password;
  readonly emailAddress: string;
  readonly firstName: Name;
  readonly lastName: Name;
  readonly bio: Bio;
}

function buildAccountInput(data: SignUpFormData): AccountInput {
  return {
    username: data.username.trim(),
    password: data.password,
    emailAddress: data.emailAddress,
    firstName: '',
    lastName: '',
    bio: '',
  };
}

function validateAccountInput({ username, password }: AccountInput): boolean {
  if (!isValidUsernameScalar(username)) {
    message.error('Username must be lowercase and not contain spaces.', 5);
    return false;
  }
  if (!isValidPasswordScalar(password)) {
    message.error('Password must contain characters other than spaces.', 5);
    return false;
  }
  return true;
}

async function operateCreateAccount(account: AccountInput): Promise<void> {
  const response = await createAccount(account);
  if (response?.createAccount === null)
    message.success('Account created. Check your email for an account verification code.', 5);
  switch (response?.createAccount?.__typename) {
    case 'EmailAddressTaken':
      message.error('That email address has already been registered.', 5);
      break;
    case 'InvalidDomain':
      message.error("This Omni Chat server disallows the provided email address's domain.", 7.5);
      break;
    case 'UsernameTaken':
      message.error('That username has already been taken.', 5);
  }
}

interface CreateAccountResult {
  readonly createAccount: UsernameTaken | EmailAddressTaken | InvalidDomain | null;
}

interface UsernameTaken {
  readonly __typename: 'UsernameTaken';
}

interface EmailAddressTaken {
  readonly __typename: 'EmailAddressTaken';
}

interface InvalidDomain {
  readonly __typename: 'InvalidDomain';
}

async function createAccount(account: AccountInput): Promise<CreateAccountResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(httpApiConfig, {
        query: `
          mutation CreateAccount($account: AccountInput!) {
            createAccount(account: $account) {
              __typename
            }
          }
        `,
        variables: { account },
      }),
  );
}

interface ReadAllowedEmailAddressDomainsResult {
  readonly readAllowedEmailAddressDomains: string[];
}

async function readAllowedEmailAddressDomains(): Promise<ReadAllowedEmailAddressDomainsResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(httpApiConfig, {
        query: `
          query ReadAllowedEmailAddressDomains {
            readAllowedEmailAddressDomains
          }
        `,
      }),
  );
}
