import React, { ReactElement, useState } from 'react';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Storage } from '../../Storage';
import logOut from '../../logOut';
import { Button, Divider, Form, Input, Row, Space, Spin, Typography, Upload } from 'antd';
import { ShowUploadListInterface } from 'antd/lib/upload/interface';
import OriginalProfilePic from './OriginalProfilePic';
import { RestApiWrapper } from '../../api/RestApiWrapper';
import { NonexistentUserIdError } from '@neelkamath/omni-chat';
import { MutationsApiWrapper } from '../../api/MutationsApiWrapper';
import { useSelector } from 'react-redux';
import { AccountSlice } from '../../store/slices/AccountSlice';
import { RootState } from '../../store/store';
import { PicsSlice } from '../../store/slices/PicsSlice';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';

export default function AccountEditor(): ReactElement {
  return (
    <Row style={{ padding: 16 }}>
      <Space direction='vertical'>
        <ProfilePic />
        <NewProfilePicButton />
        <DeleteProfilePicButton />
      </Space>
      <Divider />
      <UpdateAccountSection />
      <Divider />
      <UpdatePasswordForm />
    </Row>
  );
}

function ProfilePic(): ReactElement {
  const userId = Storage.readUserId()!;
  const url = useSelector((state: RootState) => PicsSlice.selectPic(state, 'PROFILE_PIC', userId, 'ORIGINAL'));
  const error = useSelector((state: RootState) => PicsSlice.selectError(state, 'PROFILE_PIC', userId));
  if (error instanceof NonexistentUserIdError) logOut();
  PicsSlice.useFetchPic({ id: userId, type: 'PROFILE_PIC' });
  if (url === undefined) return <Spin size='small' />;
  else if (url === null) return <Typography.Text>No profile picture set.</Typography.Text>;
  else return <OriginalProfilePic url={url} />;
}

function DeleteProfilePicButton(): ReactElement {
  return (
    <Button danger icon={<DeleteOutlined />} onClick={MutationsApiWrapper.deleteProfilePic}>
      Delete Profile Picture
    </Button>
  );
}

function NewProfilePicButton(): ReactElement {
  const [showUploadList, setShowUploadList] = useState<ShowUploadListInterface | boolean>({ showRemoveIcon: false });
  const customRequest = async ({ file }: RcCustomRequestOptions) => {
    await RestApiWrapper.patchProfilePic(file as File);
    setShowUploadList(false);
  };
  return (
    <Upload showUploadList={showUploadList} customRequest={customRequest} accept='image/png,image/jpeg'>
      <Button icon={<UploadOutlined />}>New Profile Picture</Button>
    </Upload>
  );
}

function UpdateAccountSection(): ReactElement {
  return (
    <>
      <Typography.Paragraph>
        If you update your email address, you&apos;ll be logged out since you&apos;ll have to verify your new email
        address.
      </Typography.Paragraph>
      <UpdateAccountForm />
    </>
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
  AccountSlice.useFetchAccount();
  if (account === undefined) return <Spin />;
  const onFinish = async (data: UpdateAccountFormData) => {
    setLoading(true);
    await MutationsApiWrapper.updateAccount({
      __typename: 'AccountUpdate',
      password: null,
      ...data,
    });
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

interface UpdatePasswordFormData {
  readonly password: string;
}

function UpdatePasswordForm(): ReactElement {
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
