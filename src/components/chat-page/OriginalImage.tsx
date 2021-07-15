import React, { ReactElement } from 'react';
import { Image } from 'antd';

export interface OriginalImageProps {
  readonly type: 'PROFILE_IMAGE' | 'CHAT_IMAGE';
  readonly url: string;
}

export default function OriginalImage({ url, type }: OriginalImageProps): ReactElement {
  let alt;
  switch (type) {
    case 'CHAT_IMAGE':
      alt = 'Chat image';
      break;
    case 'PROFILE_IMAGE':
      alt = 'Profile image';
  }
  return <Image style={{ maxWidth: 500 }} alt={alt} preview={false} src={url} />;
}
