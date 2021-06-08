import React, { ReactElement } from 'react';
import { message, Space, Spin, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { NonexistentChatError } from '@neelkamath/omni-chat';
import DeletePicButton from './DeleteProfilePicButton';
import NewPicButton from './NewPicButton';
import { ChatsSlice } from '../../../../../store/slices/ChatsSlice';
import { RootState, useThunkDispatch } from '../../../../../store/store';
import { Storage } from '../../../../../Storage';
import { PicsSlice } from '../../../../../store/slices/PicsSlice';
import { ChatPageLayoutSlice } from '../../../../../store/slices/ChatPageLayoutSlice';
import OriginalPic from '../../../OriginalPic';

interface PicSectionProps {
  readonly chatId: number;
}

export default function PicSection({ chatId }: PicSectionProps): ReactElement {
  const isAdmin = useSelector((state: RootState) => ChatsSlice.selectIsAdmin(state, chatId, Storage.readUserId()!));
  return (
    <Space direction='vertical'>
      <ChatPic chatId={chatId} />
      {isAdmin && <NewPicButton chatId={chatId} />}
      {isAdmin && <DeletePicButton chatId={chatId} />}
    </Space>
  );
}

interface ChatPicProps {
  readonly chatId: number;
}

function ChatPic({ chatId }: ChatPicProps): ReactElement {
  const dispatch = useDispatch();
  const url = useSelector((state: RootState) => PicsSlice.selectPic(state, 'GROUP_CHAT_PIC', chatId, 'ORIGINAL'));
  const error = useSelector((state: RootState) => PicsSlice.selectError(state, 'GROUP_CHAT_PIC', chatId));
  if (error instanceof NonexistentChatError) {
    message.warning("You're no longer in this chat.", 5);
    dispatch(ChatPageLayoutSlice.update({ type: 'EMPTY' }));
  }
  useThunkDispatch(PicsSlice.fetchPic({ id: chatId, type: 'GROUP_CHAT_PIC' }));
  if (url === undefined) return <Spin size='small' />;
  else if (url === null) return <Typography.Text>No group chat pic set.</Typography.Text>;
  else return <OriginalPic type='CHAT_PIC' url={url} />;
}
