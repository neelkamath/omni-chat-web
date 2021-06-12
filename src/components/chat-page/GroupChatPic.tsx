import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../store/store';
import { PicsSlice } from '../../store/slices/PicsSlice';
import CustomPic from './CustomPic';
import { TeamOutlined } from '@ant-design/icons';

export interface GroupChatPicProps {
  readonly chatId: number;
}

export default function GroupChatPic({ chatId }: GroupChatPicProps): ReactElement {
  /*
  A <NonexistentChatError> will occur when the chat has been deleted. It's the responsibility of the parent element to
  handle this accordingly.
   */
  const url = useSelector((state: RootState) => PicsSlice.selectPic(state, 'GROUP_CHAT_PIC', chatId, 'THUMBNAIL'));
  useThunkDispatch(PicsSlice.fetchPic({ id: chatId, type: 'GROUP_CHAT_PIC' }));
  return <CustomPic icon={<TeamOutlined />} url={url} />;
}
