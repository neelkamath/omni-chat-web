import React, { ReactElement } from 'react';
import HomeLayout from '../HomeLayout';
import { Divider, Row } from 'antd';
import SignInSection from './SignInSection';
import EmailPasswordResetCodeSection from './EmailPasswordResetCodeSection';
import ResetPasswordSection from './ResetPasswordSection';

export default function SignInPage(): ReactElement {
  return (
    <HomeLayout>
      <Row gutter={16} style={{ padding: 16 }}>
        <Row>
          <SignInSection />
          <Divider />
          <EmailPasswordResetCodeSection />
          <Divider />
          <ResetPasswordSection />
        </Row>
      </Row>
    </HomeLayout>
  );
}
