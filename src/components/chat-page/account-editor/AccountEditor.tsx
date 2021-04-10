import React, { ReactElement } from 'react';
import { Divider, Row } from 'antd';
import UpdateAccountSection from './UpdateAccountSection';
import UpdatePasswordForm from './UpdatePasswordForm';
import DeleteAccountSection from './DeleteAccountSection';
import ProfilePicEditor from './ProfilePicEditor';

export default function AccountEditor(): ReactElement {
  return (
    <Row style={{ padding: 16 }}>
      <ProfilePicEditor />
      <Divider />
      <UpdateAccountSection />
      <Divider />
      <UpdatePasswordForm />
      <Divider />
      <DeleteAccountSection />
    </Row>
  );
}

