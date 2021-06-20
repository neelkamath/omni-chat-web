import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../store/store';
import { PicsSlice } from '../../store/slices/PicsSlice';
import CustomPic from './CustomPic';
import { UserOutlined } from '@ant-design/icons';

export interface PrivateChatPicProps {
  readonly userId: number;
}

export default function PrivateChatPic({ userId }: PrivateChatPicProps): ReactElement {
  /*
  A <NonexistentUserIdError> will occur when the user deletes their account. It's the responsibility of the parent
  element to handle this accordingly.
   */
  const url = useSelector((state: RootState) => PicsSlice.selectPic(state, 'PROFILE_PIC', userId, 'THUMBNAIL'));
  useThunkDispatch(PicsSlice.fetch({ id: userId, type: 'PROFILE_PIC' }));
  return <CustomPic icon={<UserOutlined />} url={url} />;
}
