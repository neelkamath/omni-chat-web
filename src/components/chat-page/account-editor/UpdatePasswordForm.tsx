import React, { ReactElement, useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { Storage } from '../../../Storage';
import { AccountUpdate, isValidPasswordScalar, updateAccount } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../api';

interface UpdatePasswordFormData {
  readonly password: string;
}

export default function UpdatePasswordForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onFinish = async ({ password }: UpdatePasswordFormData) => {
    setLoading(true);
    const update = buildAccountUpdate(password);
    if (validateAccountUpdate(update)) await operateUpdateAccount(update);
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name='updatePassword' layout='vertical'>
      <Form.Item name='password' label='New password' rules={[{ required: true, message: 'Enter a password.' }]}>
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

function buildAccountUpdate(password: string): AccountUpdate {
  return {
    __typename: 'AccountUpdate',
    username: null,
    password,
    emailAddress: null,
    firstName: null,
    lastName: null,
    bio: null,
  };
}

function validateAccountUpdate({ password }: AccountUpdate): boolean {
  if (password !== null && !isValidPasswordScalar(password)) {
    message.error('Password must contain characters other than spaces.', 5);
    return false;
  }
  return true;
}

async function operateUpdateAccount(update: AccountUpdate): Promise<void> {
  const result = await operateGraphQlApi(() => updateAccount(httpApiConfig, Storage.readAccessToken()!, update));
  if (result?.updateAccount === null) message.success('Account updated.', 3);
}
