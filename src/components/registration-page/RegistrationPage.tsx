import React, { ReactElement } from 'react';
import { Divider, Row } from 'antd';
import HomeLayout from '../HomeLayout';
import SignUpSection from './SignUpSection';
import ResendEmailAddressVerificationCodeSection from './ResendEmailAddressVerificationCodeSection';
import VerifyYourEmailAddressSection from './VerifyYourEmailAddressSection';

export default function RegistrationPage(): ReactElement {
  return (
    <HomeLayout>
      <Row gutter={16} style={{ padding: 16 }}>
        <SignUpSection />
        <Divider />
        <VerifyYourEmailAddressSection />
        <Divider />
        <ResendEmailAddressVerificationCodeSection />
      </Row>
    </HomeLayout>
  );
}
