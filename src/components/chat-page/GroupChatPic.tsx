import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PicsSlice } from '../../store/slices/PicsSlice';
import CustomPic from './CustomPic';
import { TeamOutlined } from '@ant-design/icons';
import { RootState } from '../../store/store';

export interface GroupChatPicProps {
  readonly chatId: number;
}

export default function GroupChatPic({ chatId }: GroupChatPicProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(PicsSlice.fetch({ id: chatId, type: 'GROUP_CHAT_PIC' }));
  }, [dispatch, chatId]);
  /*
  A <NonexistentChatError> will occur when the chat has been deleted. It's the responsibility of the parent element to
  handle this accordingly.
   */
  const url = useSelector((state: RootState) => PicsSlice.selectPic(state, 'GROUP_CHAT_PIC', chatId, 'THUMBNAIL'));
  return <CustomPic icon={<TeamOutlined />} url={url} />;
}
