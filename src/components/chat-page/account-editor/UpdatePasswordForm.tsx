import React, { ReactElement, useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { Storage } from '../../../Storage';
import { isValidPasswordScalar, Password, queryOrMutate } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../api';

interface UpdatePasswordFormData {
  readonly password: string;
}

export default function UpdatePasswordForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onFinish = async (data: UpdatePasswordFormData) => {
    setLoading(true);
    if (validateAccountUpdate(data)) await operateUpdateAccount(data);
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

interface AccountUpdate {
  readonly password: Password;
}

function validateAccountUpdate({ password }: AccountUpdate): boolean {
  if (password !== null && !isValidPasswordScalar(password)) {
    message.error('Password must contain characters other than spaces.', 5);
    return false;
  }
  return true;
}

async function operateUpdateAccount(update: AccountUpdate): Promise<void> {
  const response = await updateAccount(update);
  if (response?.updateAccount === null) message.success('Account updated.', 3);
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
