import React, { ReactElement } from 'react';
import HomeLayout from './HomeLayout';
import { Row } from 'antd';
import DevelopersSection from './DevelopersSection';

export default function DevelopersPage(): ReactElement {
  return (
    <HomeLayout>
      <Row style={{ padding: 16 }}>
        <DevelopersSection />
      </Row>
    </HomeLayout>
  );
}
