import React, { ReactElement } from 'react';
import { Avatar, Spin } from 'antd';
import { ImagesSlice } from '../../store/slices/ImagesSlice';
import { AvatarSize } from 'antd/lib/avatar/SizeContext';

export interface CustomImageProps {
  readonly icon: ReactElement;
  readonly url: ImagesSlice.ImageUrl;
  readonly size?: AvatarSize;
}

export default function CustomImage({ icon, url, size }: CustomImageProps): ReactElement {
  if (url === undefined) return <Spin size='small' />;
  return <Avatar size={size ?? 'large'} icon={url === null ? icon : undefined} src={url} />;
}
