import React, { ReactElement } from 'react';
import { Avatar, Spin } from 'antd';
import { PicsSlice } from '../../store/slices/PicsSlice';
import { AvatarSize } from 'antd/lib/avatar/SizeContext';

export interface CustomPicProps {
  readonly icon: ReactElement;
  readonly url: PicsSlice.PicUrl;
  readonly size?: AvatarSize;
}

export default function CustomPic({ icon, url, size }: CustomPicProps): ReactElement {
  if (url === undefined) return <Spin size='small' />;
  return <Avatar size={size ?? 'large'} icon={url === null ? icon : undefined} src={url} />;
}
