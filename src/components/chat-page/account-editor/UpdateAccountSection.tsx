import React, { ReactElement, useEffect, useState } from 'react';
import { Button, Form, Input, message, Space, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { Storage } from '../../../Storage';
import { Bio, isValidNameScalar, isValidUsernameScalar, Name, queryOrMutate, Username } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import GfmFormItem from '../GfmFormItem';
import setOnline from '../../../setOnline';
import logOut from '../../../logOut';
import { AccountsSlice } from '../../../store/slices/AccountsSlice';

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
  const userId = Storage.readUserId()!;
  const account = useSelector((state: RootState) => AccountsSlice.select(state, userId));
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(AccountsSlice.fetchAccount(userId));
  }, [dispatch, userId]);
  if (account === undefined) return <Spin />;
  const onFinish = async (data: UpdateAccountFormData) => {
    setLoading(true);
    const update = buildAccountUpdate(data);
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
      <GfmFormItem initialValue={account.bio} maxLength={2_500} name='bio' label='Bio' />
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

interface AccountUpdate {
  readonly username: Username;
  readonly password: null;
  readonly emailAddress: string;
  readonly firstName: Name;
  readonly lastName: Name;
  readonly bio: Bio;
}

function buildAccountUpdate({
  username,
  emailAddress,
  firstName,
  lastName,
  bio,
}: UpdateAccountFormData): AccountUpdate {
  return {
    username: username.trim(),
    password: null,
    emailAddress: emailAddress,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    bio: bio.trim(),
  };
}

function validateAccountUpdate({ username, firstName, lastName }: AccountUpdate): boolean {
  if (username !== null && !isValidUsernameScalar(username)) {
    message.error(
      'A username must be 1-30 characters long. Only lowercase English letters (a-z), English numbers (0-9), ' +
        'periods, and underscores are allowed.',
      10,
    );
    return false;
  }
  const isInvalidName = (name: Name | null) => name !== null && !isValidNameScalar(name);
  if (isInvalidName(firstName) || isInvalidName(lastName)) {
    message.error("Name mustn't contain spaces.", 5);
    return false;
  }
  return true;
}

async function operateUpdateAccount(currentEmailAddress: string, update: AccountUpdate): Promise<void> {
  const isUpdatedAddress = update.emailAddress !== undefined && currentEmailAddress !== update.emailAddress;
  if (isUpdatedAddress) await setOnline(false);
  const response = await updateAccount(update);
  if (response?.updateAccount === null) {
    message.success('Account updated.', 3);
    if (isUpdatedAddress) {
      const setOnlineStatus = false;
      await logOut(setOnlineStatus);
    }
  } else if (response?.updateAccount?.__typename === 'UsernameTaken')
    message.error('That username has already been taken.', 5);
  else if (response?.updateAccount?.__typename === 'EmailAddressTaken')
    message.error('That email address has already been taken.', 5);
}

interface UsernameTaken {
  readonly __typename: 'UsernameTaken';
}

interface EmailAddressTaken {
  readonly __typename: 'EmailAddressTaken';
}

interface UpdateAccountResult {
  readonly updateAccount: UsernameTaken | EmailAddressTaken | null;
}

async function updateAccount(update: AccountUpdate): Promise<UpdateAccountResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation UpdateAccount($update: AccountUpdate!) {
              updateAccount(update: $update) {
                __typename
              }
            }
          `,
          variables: { update },
        },
        Storage.readAccessToken()!,
      ),
  );
}
