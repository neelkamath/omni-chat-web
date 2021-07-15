import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ImagesSlice } from '../../store/slices/ImagesSlice';
import CustomImage from './CustomImage';
import { UserOutlined } from '@ant-design/icons';
import { RootState } from '../../store/store';

export interface PrivateChatImageProps {
  readonly userId: number;
}

export default function PrivateChatImage({ userId }: PrivateChatImageProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ImagesSlice.fetch({ id: userId, type: 'PROFILE_IMAGE' }));
  }, [dispatch, userId]);
  /*
  A <NonexistentUserIdError> will occur when the user deletes their account. It's the responsibility of the parent
  element to handle this accordingly.
   */
  const url = useSelector((state: RootState) => ImagesSlice.selectImage(state, 'PROFILE_IMAGE', userId, 'THUMBNAIL'));
  return <CustomImage icon={<UserOutlined />} url={url} />;
}
