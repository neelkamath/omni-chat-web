import React, { ReactElement, useEffect, useState } from 'react';
import { Button, message, Space, Spin, Typography, Upload } from 'antd';
import { Storage } from '../../../Storage';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { PicsSlice } from '../../../store/slices/PicsSlice';
import {
  InvalidPicError,
  NonexistentUserIdError,
  patchProfilePic,
  Placeholder,
  queryOrMutate,
} from '@neelkamath/omni-chat';
import logOut from '../../../logOut';
import OriginalPic from '../OriginalPic';
import { ShowUploadListInterface } from 'antd/lib/upload/interface';
import { UploadRequestOption } from 'rc-upload/lib/interface';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { httpApiConfig, operateGraphQlApi, operateRestApi } from '../../../api';

export default function ProfilePicEditor(): ReactElement {
  return (
    <Space direction='vertical'>
      <ProfilePic />
      <NewProfilePicButton />
      <DeleteProfilePicButton />
    </Space>
  );
}

function ProfilePic(): ReactElement {
  const userId = Storage.readUserId()!;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(PicsSlice.fetch({ id: userId, type: 'PROFILE_PIC' }));
  }, [dispatch, userId]);
  const url = useSelector((state: RootState) => PicsSlice.selectPic(state, 'PROFILE_PIC', userId, 'ORIGINAL'));
  const error = useSelector((state: RootState) => PicsSlice.selectError(state, 'PROFILE_PIC', userId));
  if (error instanceof NonexistentUserIdError) logOut();
  if (url === undefined) return <Spin size='small' />;
  else if (url === null) return <Typography.Text>No profile picture set.</Typography.Text>;
  else return <OriginalPic type='PROFILE_PIC' url={url} />;
}

function NewProfilePicButton(): ReactElement {
  const [showUploadList, setShowUploadList] = useState<ShowUploadListInterface | boolean>({ showRemoveIcon: false });
  const customRequest = async ({ file }: UploadRequestOption) => {
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
    if (error instanceof InvalidPicError) message.error("The picture mustn't exceed 5 MB.", 5);
    else throw error;
  }
}

function DeleteProfilePicButton(): ReactElement {
  const onClick = async () => {
    const response = await deleteProfilePic();
    if (response !== undefined) message.success('Profile picture deleted.', 3);
  };
  return (
    <Button danger icon={<DeleteOutlined />} onClick={onClick}>
      Delete Profile Picture
    </Button>
  );
}

interface DeleteProfilePicResult {
  readonly deleteProfilePic: Placeholder;
}

async function deleteProfilePic(): Promise<DeleteProfilePicResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation DeleteProfilePic {
              deleteProfilePic
            }
          `,
        },
        Storage.readAccessToken()!,
      ),
  );
}
