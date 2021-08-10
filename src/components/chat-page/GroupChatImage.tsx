import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ImagesSlice } from '../../store/slices/ImagesSlice';
import CustomImage from './CustomImage';
import { TeamOutlined } from '@ant-design/icons';
import { RootState } from '../../store/store';

export interface GroupChatImageProps {
  readonly chatId: number;
}

export default function GroupChatImage({ chatId }: GroupChatImageProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ImagesSlice.fetchImage({ id: chatId, type: 'GROUP_CHAT_IMAGE' }));
  }, [dispatch, chatId]);
  /*
  A <NonexistentChatError> will occur when the chat has been deleted. It's the responsibility of the parent element to
  handle this accordingly.
   */
  const url = useSelector((state: RootState) =>
    ImagesSlice.selectImage(state, 'GROUP_CHAT_IMAGE', chatId, 'THUMBNAIL'),
  );
  return <CustomImage icon={<TeamOutlined />} url={url} />;
}
