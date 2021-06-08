import React, { ReactElement, useState } from 'react';
import { Button, Form, Input, message, Space, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { AccountSlice } from '../../../store/slices/AccountSlice';
import { useThunkDispatch } from '../../../store/store';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import { Storage } from '../../../Storage';
import logOut from '../../../logOut';
import { queryOrMutate } from '@neelkamath/omni-chat';

export default function DeleteAccountSection(): ReactElement {
  return (
    <Space direction='vertical'>
      If you delete your account, all of your data will be wiped. This means that your private chats with other users
      will be deleted, etc. Since this is an irreversible action, the support team will be unable to retrieve your data
      if you change your mind later on.
      <DeleteAccountForm />
    </Space>
  );
}

interface DeleteAccountFormData {
  readonly username: string;
}

function DeleteAccountForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const username = useSelector(AccountSlice.select)?.username;
  useThunkDispatch(AccountSlice.fetchAccount());
  if (username === undefined) return <Spin />;
  const onFinish = async (data: DeleteAccountFormData) => {
    setLoading(true);
    data.username === username ? await operateDeleteAccount() : message.error('Incorrect username.', 3);
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name='deleteAccount' layout='vertical'>
      <Form.Item
        name='username'
        label={`Enter your username (${username}) to confirm account deletion.`}
        rules={[{ required: true, message: 'Enter your username.' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading} danger>
          Permanently Delete Account
        </Button>
      </Form.Item>
    </Form>
  );
}

async function operateDeleteAccount(): Promise<void> {
  const result = await deleteAccount();
  if (result?.deleteAccount?.__typename === 'CannotDeleteAccount')
    message.error(
      "You can't delete your account yet because you're the last admin of an otherwise nonempty group chat. You must" +
        'first assign another user as the admin.',
      12.5,
    );
  else {
    Storage.deleteTokenSet();
    await logOut();
  }
}

interface CannotDeleteAccount {
  readonly __typename: 'CannotDeleteAccount';
}

interface DeleteAccountResult {
  readonly deleteAccount: CannotDeleteAccount | null;
}

async function deleteAccount(): Promise<DeleteAccountResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation DeleteAccount {
              deleteAccount {
                __typename
              }
            }
          `,
        },
        Storage.readAccessToken()!,
      ),
  );
}