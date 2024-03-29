import React, { ReactElement, useState } from 'react';
import { ShowUploadListInterface } from 'antd/lib/upload/interface';
import { UploadRequestOption } from 'rc-upload/lib/interface';
import { message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import {
  MustBeAdminError,
  postAudioMessage,
  postDocMessage,
  postImageMessage,
  postVideoMessage,
  UserNotInChatError,
} from '@neelkamath/omni-chat';
import { httpApiConfig } from '../../../../api';
import { Storage } from '../../../../Storage';
import Dragger from 'antd/lib/upload/Dragger';

export interface MediaMessageCreatorProps {
  readonly chatId: number;
  readonly type: MediaMessageType;
}

export type MediaMessageType = 'IMAGE' | 'DOC' | 'VIDEO' | 'AUDIO';

export default function MediaMessageCreator({ chatId, type }: MediaMessageCreatorProps): ReactElement {
  const [showUploadList, setShowUploadList] = useState<ShowUploadListInterface | boolean>({ showRemoveIcon: false });
  const customRequest = async (option: UploadRequestOption) => {
    await createMessage(option.file as File, type, chatId);
    setShowUploadList(false);
  };
  return (
    <Dragger showUploadList={showUploadList} customRequest={customRequest} multiple accept={getAccept(type)}>
      <p className='ant-upload-drag-icon'>
        <UploadOutlined />
      </p>
      <p className='ant-upload-text'>Click or drag {getText(type)} to this area to upload</p>
    </Dragger>
  );
}

function getAccept(type: MediaMessageType): string | undefined {
  switch (type) {
    case 'DOC':
      return undefined;
    case 'IMAGE':
      return 'image/png,image/jpeg';
    case 'VIDEO':
      return 'video/mp4';
    case 'AUDIO':
      return 'audio/mpeg,audio/mp4';
  }
}

function getText(type: MediaMessageType): string {
  switch (type) {
    case 'IMAGE':
      return 'images';
    case 'DOC':
      return 'documents';
    case 'VIDEO':
      return 'videos';
    case 'AUDIO':
      return 'audios';
  }
}

async function createMessage(file: File, type: MediaMessageType, chatId: number): Promise<void> {
  if (file.size > 3 * 1_024 * 1_024)
    message.error(`${file.name} couldn't be sent because it was bigger than 3 MB.`, 7.5);
  else
    try {
      switch (type) {
        case 'DOC':
          await postDocMessage(httpApiConfig, Storage.readAccessToken()!, file, chatId);
          break;
        case 'IMAGE':
          await postImageMessage(httpApiConfig, Storage.readAccessToken()!, file, chatId);
          break;
        case 'VIDEO':
          await postVideoMessage(httpApiConfig, Storage.readAccessToken()!, file, chatId);
          break;
        case 'AUDIO':
          await postAudioMessage(httpApiConfig, Storage.readAccessToken()!, file, chatId);
      }
    } catch (error) {
      if (error instanceof UserNotInChatError) message.error("You're no longer in the chat.", 5);
      else if (error instanceof MustBeAdminError) message.error('Only admins can send messages in broadcast chats.', 5);
    }
}
