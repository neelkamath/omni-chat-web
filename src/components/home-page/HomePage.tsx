import React, { ReactElement } from 'react';
import { Image, Row, Space, Typography } from 'antd';
import coverImage from '../../images/cover.png';
import HomeLayout from '../HomeLayout';
import FeaturesRow from './FeaturesRow';
import TheProblemRow from './TheProblemRow';
import UserStoriesRow from './UserStoriesRow';

export default function HomePage(): ReactElement {
  return (
    <HomeLayout>
      <Space direction='vertical'>
        <Image preview={false} src={coverImage} alt='Cover' />
        <Row gutter={16} justify='space-around'>
          <Typography.Title level={2}>Trusted, Extensible, Better Chat</Typography.Title>
        </Row>
      </Space>
      <Row style={{ padding: 16 }}>
        <TheProblemRow />
        <FeaturesRow />
        <UserStoriesRow />
      </Row>
    </HomeLayout>
  );
}
