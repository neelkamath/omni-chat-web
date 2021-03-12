import React, {ReactElement} from 'react';
import {Divider, Row} from 'antd';
import HomeLayout from '../HomeLayout';
import SignUpSection from './SignUpSection';
import ResendEmailAddressVerificationCodeSection from './ResendEmailAddressVerificationCodeSection';

export default function RegistrationPage(): ReactElement {
  return (
    <HomeLayout>
      <Row gutter={16} style={{padding: 16}}>
        <SignUpSection />
        <Divider />
        <ResendEmailAddressVerificationCodeSection />
      </Row>
    </HomeLayout>
  );
}
