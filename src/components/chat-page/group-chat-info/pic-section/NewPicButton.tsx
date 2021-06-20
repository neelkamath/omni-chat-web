import React, { ReactElement, useState } from 'react';
import { ShowUploadListInterface } from 'antd/lib/upload/interface';
import { UploadRequestOption } from 'rc-upload/lib/interface';
import { Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { InvalidPicError, patchGroupChatPic } from '@neelkamath/omni-chat';
import { httpApiConfig, operateRestApi } from '../../../../api';
import { Storage } from '../../../../Storage';

export interface NewPicButtonProps {
  readonly chatId: number;
}

export default function NewPicButton({ chatId }: NewPicButtonProps): ReactElement {
  const [showUploadList, setShowUploadList] = useState<ShowUploadListInterface | boolean>({ showRemoveIcon: false });
  const customRequest = async ({ file }: UploadRequestOption) => {
    await operatePatchGroupChatPic(chatId, file as File);
    setShowUploadList(false);
  };
  return (
    <Upload showUploadList={showUploadList} customRequest={customRequest} accept='image/png,image/jpeg'>
      <Button icon={<UploadOutlined />}>New Group Chat Picture</Button>
    </Upload>
  );
}

async function operatePatchGroupChatPic(chatId: number, file: File): Promise<void> {
  try {
    await operateRestApi(() => patchGroupChatPic(httpApiConfig, Storage.readAccessToken()!, chatId, file));
    message.success('Group chat picture updated.', 3);
  } catch (error) {
    if (error instanceof InvalidPicError) message.error('The picture mustn\'t exceed 5 MB.', 5);
    else throw error;
  }
}
