import React, { ReactElement } from 'react';
import { Space } from 'antd';
import { blue } from '@ant-design/colors';
import { AuditOutlined } from '@ant-design/icons';

export default function AdminIndicator(): ReactElement {
  return (
    <Space style={{ color: blue.primary }}>
      <AuditOutlined /> Admin
    </Space>
  );
}
