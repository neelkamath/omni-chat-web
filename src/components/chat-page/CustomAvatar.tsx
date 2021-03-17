import React, { ReactElement } from 'react';
import { Avatar, Spin } from 'antd';
import { PicsSlice } from '../../store/slices/PicsSlice';
import { AvatarSize } from 'antd/lib/avatar/SizeContext';
import PicUrl = PicsSlice.PicUrl;

export interface CustomAvatarProps {
  readonly icon: ReactElement;
  readonly url: PicUrl;
  readonly size?: AvatarSize;
}

export default function CustomAvatar({ icon, url, size }: CustomAvatarProps): ReactElement {
  if (url === undefined) return <Spin size='small' />;
  return <Avatar size={size === undefined ? 'large' : size} icon={url === null ? icon : undefined} src={url} />;
}
