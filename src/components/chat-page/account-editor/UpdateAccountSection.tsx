import React, { ReactElement, useState } from 'react';
import { Button, Form, Input, Space, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { AccountSlice } from '../../../store/slices/AccountSlice';
import { useThunkDispatch } from '../../../store/store';
import { MutationsApiWrapper } from '../../../api/MutationsApiWrapper';

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
  const account = useSelector(AccountSlice.select);
  useThunkDispatch(AccountSlice.fetchAccount());
  if (account === undefined) return <Spin />;
  const onFinish = async (data: UpdateAccountFormData) => {
    setLoading(true);
    await MutationsApiWrapper.updateAccount({ __typename: 'AccountUpdate', password: null, ...data });
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name='updateAccount' layout='vertical'>
      <Form.Item
        name='username'
        label='Username'
        initialValue={account.username}
        rules={[{ required: true, message: 'Enter a username.' }]}
      >
        <Input />
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
        <Input />
      </Form.Item>
      <Form.Item name='lastName' label='Last name' initialValue={account.lastName}>
        <Input />
      </Form.Item>
      <Form.Item name='bio' label='Bio' initialValue={account.bio}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
