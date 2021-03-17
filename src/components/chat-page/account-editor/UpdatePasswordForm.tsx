import React, { ReactElement, useState } from 'react';
import { MutationsApiWrapper } from '../../../api/MutationsApiWrapper';
import { Button, Form, Input } from 'antd';

interface UpdatePasswordFormData {
  readonly password: string;
}

export default function UpdatePasswordForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onFinish = async ({ password }: UpdatePasswordFormData) => {
    setLoading(true);
    await MutationsApiWrapper.updateAccount({
      __typename: 'AccountUpdate',
      username: null,
      password,
      emailAddress: null,
      firstName: null,
      lastName: null,
      bio: null,
    });
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
