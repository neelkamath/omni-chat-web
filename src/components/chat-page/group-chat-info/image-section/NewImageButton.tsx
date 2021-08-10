import React, { ReactElement, useState } from 'react';
import { ShowUploadListInterface } from 'antd/lib/upload/interface';
import { UploadRequestOption } from 'rc-upload/lib/interface';
import { Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { InvalidImageError, patchGroupChatImage } from '@neelkamath/omni-chat';
import { httpApiConfig, operateRestApi } from '../../../../api';
import { Storage } from '../../../../Storage';

export interface NewImageButtonProps {
  readonly chatId: number;
}

export default function NewImageButton({ chatId }: NewImageButtonProps): ReactElement {
  const [showUploadList, setShowUploadList] = useState<ShowUploadListInterface | boolean>({ showRemoveIcon: false });
  const customRequest = async ({ file }: UploadRequestOption) => {
    await operatePatchGroupChatImage(chatId, file as File);
    setShowUploadList(false);
  };
  return (
    <Upload showUploadList={showUploadList} customRequest={customRequest} accept='image/png,image/jpeg'>
      <Button icon={<UploadOutlined />}>New Group Chat Image</Button>
    </Upload>
  );
}

async function operatePatchGroupChatImage(chatId: number, file: File): Promise<void> {
  try {
    await operateRestApi(() => patchGroupChatImage(httpApiConfig, Storage.readAccessToken()!, chatId, file));
    message.success('Group chat image updated.', 3);
  } catch (error) {
    if (error instanceof InvalidImageError) message.error("The image mustn't exceed 3 MB.", 5);
    else throw error;
  }
}
