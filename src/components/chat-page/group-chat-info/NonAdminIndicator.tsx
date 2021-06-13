import React, { ReactElement } from 'react';
import { Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';

export default function NonAdminIndicator(): ReactElement {
  return (
    <Space>
      <UserOutlined /> Non-admin
    </Space>
  );
}
