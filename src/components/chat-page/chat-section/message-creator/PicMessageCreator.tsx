import React, { ReactElement, useState } from 'react';
import { ShowUploadListInterface } from 'antd/lib/upload/interface';
import { UploadRequestOption } from 'rc-upload/lib/interface';
import { Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { postPicMessage } from '@neelkamath/omni-chat';
import { httpApiConfig } from '../../../../api';
import { Storage } from '../../../../Storage';

export interface PicMessageCreatorProps {
  readonly chatId: number;
}

export default function PicMessageCreator({ chatId }: PicMessageCreatorProps): ReactElement {
  const [showUploadList, setShowUploadList] = useState<ShowUploadListInterface | boolean>({ showRemoveIcon: false });
  const customRequest = async (option: UploadRequestOption) => {
    const file = option.file as File;
    if (file.size > 5 * 1024 * 1024)
      message.error(`${file.name} couldn't upload because it was bigger than 5 MB.`, 7.5);
    else await postPicMessage(httpApiConfig, Storage.readAccessToken()!, file, chatId);
    setShowUploadList(false);
  };
  return (
    <Upload showUploadList={showUploadList} customRequest={customRequest} multiple accept='image/png,image/jpeg'>
      <Button icon={<UploadOutlined />}>Upload any number of images</Button>
    </Upload>
  );
}