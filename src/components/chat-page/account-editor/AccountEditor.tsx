import React, { ReactElement } from 'react';
import { Divider, Row } from 'antd';
import UpdateAccountSection from './UpdateAccountSection';
import UpdatePasswordForm from './UpdatePasswordForm';
import DeleteAccountSection from './DeleteAccountSection';
import ProfileImageEditor from './ProfileImageEditor';

export default function AccountEditor(): ReactElement {
  return (
    <Row style={{ padding: 16 }}>
      <ProfileImageEditor />
      <Divider />
      <UpdateAccountSection />
      <Divider />
      <UpdatePasswordForm />
      <Divider />
      <DeleteAccountSection />
    </Row>
  );
}
