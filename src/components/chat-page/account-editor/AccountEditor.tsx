import React, { ReactElement, useState } from 'react';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Storage } from '../../../Storage';
import logOut from '../../../logOut';
import { Button, Divider, Row, Space, Spin, Typography, Upload } from 'antd';
import { ShowUploadListInterface } from 'antd/lib/upload/interface';
import OriginalProfilePic from '../OriginalProfilePic';
import { RestApiWrapper } from '../../../api/RestApiWrapper';
import { NonexistentUserIdError } from '@neelkamath/omni-chat';
import { MutationsApiWrapper } from '../../../api/MutationsApiWrapper';
import { useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../../store/store';
import { PicsSlice } from '../../../store/slices/PicsSlice';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import UpdateAccountSection from './UpdateAccountSection';
import UpdatePasswordForm from './UpdatePasswordForm';
import DeleteAccountSection from './DeleteAccountSection';

export default function AccountEditor(): ReactElement {
  return (
    <Row style={{ padding: 16 }}>
      <Space direction='vertical'>
        <ProfilePic />
        <NewProfilePicButton />
        <DeleteProfilePicButton />
      </Space>
      <Divider />
      <UpdateAccountSection />
      <Divider />
      <UpdatePasswordForm />
      <Divider />
      <DeleteAccountSection />
    </Row>
  );
}

function ProfilePic(): ReactElement {
  const userId = Storage.readUserId()!;
  const url = useSelector((state: RootState) => PicsSlice.selectPic(state, 'PROFILE_PIC', userId, 'ORIGINAL'));
  const error = useSelector((state: RootState) => PicsSlice.selectError(state, 'PROFILE_PIC', userId));
  if (error instanceof NonexistentUserIdError) {
    const mustSetOffline = false;
    logOut(mustSetOffline);
  }
  useThunkDispatch(PicsSlice.fetchPic({ id: userId, type: 'PROFILE_PIC' }));
  if (url === undefined) return <Spin size='small' />;
  else if (url === null) return <Typography.Text>No profile picture set.</Typography.Text>;
  else return <OriginalProfilePic url={url} />;
}

function NewProfilePicButton(): ReactElement {
  const [showUploadList, setShowUploadList] = useState<ShowUploadListInterface | boolean>({ showRemoveIcon: false });
  const customRequest = async ({ file }: RcCustomRequestOptions) => {
    await RestApiWrapper.patchProfilePic(file as File);
    setShowUploadList(false);
  };
  return (
    <Upload showUploadList={showUploadList} customRequest={customRequest} accept='image/png,image/jpeg'>
      <Button icon={<UploadOutlined />}>New Profile Picture</Button>
    </Upload>
  );
}

function DeleteProfilePicButton(): ReactElement {
  return (
    <Button danger icon={<DeleteOutlined />} onClick={MutationsApiWrapper.deleteProfilePic}>
      Delete Profile Picture
    </Button>
  );
}
