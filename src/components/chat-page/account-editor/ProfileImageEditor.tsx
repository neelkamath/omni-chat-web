import React, { ReactElement, useEffect, useState } from 'react';
import { Button, message, Space, Spin, Typography, Upload } from 'antd';
import { Storage } from '../../../Storage';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { ImagesSlice } from '../../../store/slices/ImagesSlice';
import {
  InvalidImageError,
  NonexistentUserIdError,
  patchProfileImage,
  Placeholder,
  queryOrMutate,
} from '@neelkamath/omni-chat';
import logOut from '../../../logOut';
import OriginalImage from '../OriginalImage';
import { ShowUploadListInterface } from 'antd/lib/upload/interface';
import { UploadRequestOption } from 'rc-upload/lib/interface';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { httpApiConfig, operateGraphQlApi, operateRestApi } from '../../../api';

export default function ProfileImageEditor(): ReactElement {
  return (
    <Space direction='vertical'>
      <ProfileImage />
      <NewProfileImageButton />
      <DeleteProfileImageButton />
    </Space>
  );
}

function ProfileImage(): ReactElement {
  const userId = Storage.readUserId()!;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ImagesSlice.fetchImage({ id: userId, type: 'PROFILE_IMAGE' }));
  }, [dispatch, userId]);
  const url = useSelector((state: RootState) => ImagesSlice.selectImage(state, 'PROFILE_IMAGE', userId, 'ORIGINAL'));
  const error = useSelector((state: RootState) => ImagesSlice.selectError(state, 'PROFILE_IMAGE', userId));
  if (error instanceof NonexistentUserIdError) {
    const setOnlineStatus = false;
    logOut(setOnlineStatus);
  }
  if (url === undefined) return <Spin size='small' />;
  else if (url === null) return <Typography.Text>No profile image set.</Typography.Text>;
  else return <OriginalImage type='PROFILE_IMAGE' url={url} />;
}

function NewProfileImageButton(): ReactElement {
  const [showUploadList, setShowUploadList] = useState<ShowUploadListInterface | boolean>({ showRemoveIcon: false });
  const customRequest = async ({ file }: UploadRequestOption) => {
    await operatePatchProfileImage(file as File);
    setShowUploadList(false);
  };
  return (
    <Upload showUploadList={showUploadList} customRequest={customRequest} accept='image/png,image/jpeg'>
      <Button icon={<UploadOutlined />}>New Profile Image</Button>
    </Upload>
  );
}

async function operatePatchProfileImage(file: File): Promise<void> {
  try {
    await operateRestApi(() => patchProfileImage(httpApiConfig, Storage.readAccessToken()!, file));
    message.success('Profile image updated.', 3);
  } catch (error) {
    if (error instanceof InvalidImageError) message.error("The image mustn't exceed 3 MB.", 5);
    else throw error;
  }
}

function DeleteProfileImageButton(): ReactElement {
  const onClick = async () => {
    const response = await deleteProfileImage();
    if (response !== undefined) message.success('Profile image deleted.', 3);
  };
  return (
    <Button danger icon={<DeleteOutlined />} onClick={onClick}>
      Delete Profile Image
    </Button>
  );
}

interface DeleteProfileImageResult {
  readonly deleteProfileImage: Placeholder;
}

async function deleteProfileImage(): Promise<DeleteProfileImageResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation DeleteProfileImage {
              deleteProfileImage
            }
          `,
        },
        Storage.readAccessToken()!,
      ),
  );
}
