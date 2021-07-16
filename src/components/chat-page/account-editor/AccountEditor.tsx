import React, { ReactElement } from 'react';
import { Divider, Row, Space, Typography } from 'antd';
import UpdateAccountSection from './UpdateAccountSection';
import UpdatePasswordForm from './UpdatePasswordForm';
import DeleteAccountSection from './DeleteAccountSection';
import ProfileImageEditor from './ProfileImageEditor';
import { UserOutlined } from '@ant-design/icons';

export default function AccountEditor(): ReactElement {
  return (
    <Space direction='vertical' style={{ padding: 16 }}>
      <Title />
      <Row>
        <ProfileImageEditor />
        <Divider />
        <UpdateAccountSection />
        <Divider />
        <UpdatePasswordForm />
        <Divider />
        <DeleteAccountSection />
      </Row>
    </Space>
  );
}

function Title(): ReactElement {
  return (
    <Typography.Title level={2}>
      <Space>
        <UserOutlined />
        Edit Account
      </Space>
    </Typography.Title>
  );
}
