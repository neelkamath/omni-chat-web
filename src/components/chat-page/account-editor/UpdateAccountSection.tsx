import React, { ReactElement, useState } from 'react';
import { Button, Form, Input, message, Space, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { AccountSlice } from '../../../store/slices/AccountSlice';
import { useThunkDispatch } from '../../../store/store';
import { Storage } from '../../../Storage';
import {
  AccountUpdate,
  isValidNameScalar,
  isValidUsernameScalar,
  Name,
  setOnline,
  updateAccount,
} from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import logOut from '../../../logOut';
import GfmFormItem from '../GfmFormItem';

export default function UpdateAccountSection(): ReactElement {
  return (
    <Space direction='vertical'>
      If you update your email address, you&apos;ll be logged out since you&apos;ll have to verify your new email
      address.
      <UpdateAccountForm />
    </Space>
  );
}

interface UpdateAccountFormData {
  readonly username: string;
  readonly emailAddress: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly bio: string;
}

function UpdateAccountForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const [bio, setBio] = useState<string | undefined>();
  const account = useSelector(AccountSlice.select);
  useThunkDispatch(AccountSlice.fetchAccount());
  if (account === undefined) return <Spin />;
  const onFinish = async (data: UpdateAccountFormData) => {
    setLoading(true);
    const update = buildAccountUpdate({ ...data, bio: bio! });
    if (validateAccountUpdate(update)) await operateUpdateAccount(account.emailAddress, update);
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name='updateAccount' layout='vertical'>
      <Form.Item
        name='username'
        label='Username'
        initialValue={account.username}
        rules={[{ required: true, message: 'Enter your email address.' }]}
      >
        <Input maxLength={30} />
      </Form.Item>
      <Form.Item
        name='emailAddress'
        label='Email address'
        initialValue={account.emailAddress}
        rules={[{ required: true, message: 'Enter an email address.' }]}
      >
        <Input type='email' />
      </Form.Item>
      <Form.Item name='firstName' label='First name' initialValue={account.firstName}>
        <Input maxLength={30} />
      </Form.Item>
      <Form.Item name='lastName' label='Last name' initialValue={account.lastName}>
        <Input maxLength={30} />
      </Form.Item>
      <GfmFormItem initialValue={account.bio} onChange={setBio} maxLength={2500} name='bio' label='Bio' />
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

function buildAccountUpdate(data: UpdateAccountFormData): AccountUpdate {
  return {
    __typename: 'AccountUpdate',
    username: data.username.trim(),
    password: null,
    emailAddress: data.emailAddress,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    bio: data.bio.trim(),
  };
}

function validateAccountUpdate({ username, firstName, lastName }: AccountUpdate): boolean {
  if (username !== null && !isValidUsernameScalar(username)) {
    message.error('Username must be lowercase and not contains spaces.', 5);
    return false;
  }
  const isInvalidName = (name: Name | null) => name !== null && !isValidNameScalar(name);
  if (isInvalidName(firstName) || isInvalidName(lastName)) {
    message.error('Name mustn\'t contain spaces.', 5);
    return false;
  }
  return true;
}

async function operateUpdateAccount(currentEmailAddress: string, update: AccountUpdate): Promise<void> {
  const isUpdatedAddress = update.emailAddress !== undefined && currentEmailAddress !== update.emailAddress;
  if (isUpdatedAddress) await operateGraphQlApi(() => setOnline(httpApiConfig, Storage.readAccessToken()!, false));
  const result = await operateGraphQlApi(() => updateAccount(httpApiConfig, Storage.readAccessToken()!, update));
  if (result?.updateAccount === null) {
    message.success('Account updated.', 3);
    if (isUpdatedAddress) await logOut();
  } else if (result?.updateAccount?.__typename === 'UsernameTaken')
    message.error('That username has already been taken.', 5);
  else if (result?.updateAccount?.__typename === 'EmailAddressTaken')
    message.error('That email address has already been taken.', 5);
}
