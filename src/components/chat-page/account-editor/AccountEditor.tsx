import React, { ReactElement, useState } from 'react';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Storage } from '../../../Storage';
import logOut from '../../../logOut';
import { Button, Divider, message, Row, Space, Spin, Typography, Upload } from 'antd';
import { ShowUploadListInterface } from 'antd/lib/upload/interface';
import OriginalProfilePic from '../OriginalProfilePic';
import { deleteProfilePic, InvalidPicError, NonexistentUserIdError, patchProfilePic } from '@neelkamath/omni-chat';
import { useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../../store/store';
import { PicsSlice } from '../../../store/slices/PicsSlice';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import UpdateAccountSection from './UpdateAccountSection';
import UpdatePasswordForm from './UpdatePasswordForm';
import DeleteAccountSection from './DeleteAccountSection';
import { httpApiConfig, operateGraphQlApi, operateRestApi } from '../../../api';

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
    const setOffline = false;
    logOut(setOffline);
  }
  useThunkDispatch(PicsSlice.fetchPic({ id: userId, type: 'PROFILE_PIC' }));
  if (url === undefined) return <Spin size='small' />;
  else if (url === null) return <Typography.Text>No profile picture set.</Typography.Text>;
  else return <OriginalProfilePic url={url} />;
}

function NewProfilePicButton(): ReactElement {
  const [showUploadList, setShowUploadList] = useState<ShowUploadListInterface | boolean>({ showRemoveIcon: false });
  const customRequest = async ({ file }: RcCustomRequestOptions) => {
    await operatePatchProfilePic(file as File);
    setShowUploadList(false);
  };
  return (
    <Upload showUploadList={showUploadList} customRequest={customRequest} accept='image/png,image/jpeg'>
      <Button icon={<UploadOutlined />}>New Profile Picture</Button>
    </Upload>
  );
}

async function operatePatchProfilePic(file: File): Promise<void> {
  try {
    await operateRestApi(() => patchProfilePic(httpApiConfig, Storage.readAccessToken()!, file));
    message.success('Profile picture updated.', 3);
  } catch (error) {
    if (error instanceof InvalidPicError) message.error('The picture mustn\'t exceed 5 MB.', 5);
    else throw error;
  }
}

function DeleteProfilePicButton(): ReactElement {
  const onClick = async () => {
    const result = await operateGraphQlApi(() => deleteProfilePic(httpApiConfig, Storage.readAccessToken()!));
    if (result !== undefined) message.success('Profile picture deleted.');
  };
  return (
    <Button danger icon={<DeleteOutlined />} onClick={onClick}>
      Delete Profile Picture
    </Button>
  );
}
