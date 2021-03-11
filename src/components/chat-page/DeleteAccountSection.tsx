import React, {ReactElement, useState} from 'react';
import {Button, Form, Input, message, Space, Spin} from 'antd';
import {MutationsApiWrapper} from '../../api/MutationsApiWrapper';
import {useDispatch, useSelector} from 'react-redux';
import {AccountSlice} from '../../store/slices/AccountSlice';

export default function DeleteAccountSection(): ReactElement {
  return (
    <Space direction="vertical" style={{padding: 16}}>
      If you delete your account, all of your data will be wiped. This means
      that your private chats with other users will be deleted, etc. Since this
      is an irreversible action, the support team will be unable to retrieve
      your data if you change your mind later on.
      <DeleteAccountForm/>
    </Space>
  );
}

interface DeleteAccountFormData {
  readonly username: string;
}

function DeleteAccountForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const username = useSelector(AccountSlice.select)?.username;
  dispatch(AccountSlice.fetchAccount());
  if (username === undefined) return <Spin/>;
  const onFinish = async (data: DeleteAccountFormData) => {
    setLoading(true);
    data.username === username
      ? await MutationsApiWrapper.deleteAccount()
      : message.error('Incorrect username.');
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name="updateAccount" layout="vertical">
      <Form.Item
        name="username"
        label={`Enter your username (${username}) to confirm account deletion.`}
        rules={[{required: true, message: 'Enter your username.'}]}
      >
        <Input/>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading} danger>
          Permanently Delete Account
        </Button>
      </Form.Item>
    </Form>
  );
}
