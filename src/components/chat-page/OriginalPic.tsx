import React, { ReactElement } from 'react';
import { Image } from 'antd';

export interface OriginalPicProps {
  readonly type: 'PROFILE_PIC' | 'CHAT_PIC';
  readonly url: string;
}

export default function OriginalPic({ url, type }: OriginalPicProps): ReactElement {
  let alt;
  switch (type) {
    case 'CHAT_PIC':
      alt = 'Chat pic';
      break;
    case 'PROFILE_PIC':
      alt = 'Profile pic';
  }
  return <Image style={{ maxWidth: 500 }} alt={alt} preview={false} src={url} />;
}
