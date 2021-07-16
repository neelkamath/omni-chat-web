import React, { ReactElement } from 'react';
import { Col, Image, Row, Space, Typography } from 'antd';
import contactUsImage from '../../images/contact-us.svg';
import SupportSection from '../SupportSection';
import { CustomerServiceOutlined } from '@ant-design/icons';

export default function ChatPageSupportSection(): ReactElement {
  return (
    <Space direction='vertical' style={{ padding: 16 }}>
      <Title />
      <Row gutter={16} justify='space-around' align='middle'>
        <Col span={10}>
          <SupportSection />
        </Col>
        <Col span={12}>
          <Image preview={false} alt='Contact us' src={contactUsImage} />
        </Col>
      </Row>
    </Space>
  );
}

function Title(): ReactElement {
  return (
    <Typography.Title level={2}>
      <Space>
        <CustomerServiceOutlined />
        Support
      </Space>
    </Typography.Title>
  );
}
