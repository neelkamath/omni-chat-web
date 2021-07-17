import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ImageMessagesSlice } from '../../../../store/slices/ImageMessagesSlice';
import { RootState } from '../../../../store/store';
import { Image, Spin } from 'antd';

export interface ImageMessageContentProps {
  readonly messageId: number;
}

export default function ImageMessageContent({ messageId }: ImageMessageContentProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ImageMessagesSlice.fetch(messageId));
  }, [dispatch, messageId]);
  const url = useSelector((state: RootState) => ImageMessagesSlice.selectImage(state, messageId)).originalUrl;
  // FIXME: Set the width to be at most 50% instead of 50% because otherwise small images get enlarged excessively. Check what happens if you put a thin but tall image.
  return url === undefined ? <Spin size='small' /> : <Image src={url} width='33%' />;
}
