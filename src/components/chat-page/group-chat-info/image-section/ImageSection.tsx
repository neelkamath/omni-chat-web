import React, { ReactElement, useEffect } from 'react';
import { Divider, message, Space, Spin, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { NonexistentChatError } from '@neelkamath/omni-chat';
import DeleteImageButton from './DeleteImageButton';
import NewImageButton from './NewImageButton';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import { RootState } from '../../../../store/store';
import { Storage } from '../../../../Storage';
import { ImagesSlice } from '../../../../store/slices/ImagesSlice';
import { ChatPageLayoutSlice } from '../../../../store/slices/ChatPageLayoutSlice';
import OriginalImage from '../../OriginalImage';

interface ImageSectionProps {
  readonly chatId: number;
}

export default function ImageSection({ chatId }: ImageSectionProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChat(chatId));
  }, [dispatch, chatId]);
  const isAdmin = useSelector((state: RootState) => ChatsSlice.selectIsAdmin(state, chatId, Storage.readUserId()!));
  const imageUrl = useSelector((state: RootState) =>
    ImagesSlice.selectImage(state, 'GROUP_CHAT_IMAGE', chatId, 'ORIGINAL'),
  );
  if (isAdmin === undefined || imageUrl === undefined) return <Spin />;
  if (imageUrl === null && !isAdmin) return <></>;
  return (
    <>
      <Divider />
      <Space direction='vertical'>
        <ChatImage chatId={chatId} />
        {isAdmin && <NewImageButton chatId={chatId} />}
        {isAdmin && <DeleteImageButton chatId={chatId} />}
      </Space>
    </>
  );
}

interface ChatImageProps {
  readonly chatId: number;
}

function ChatImage({ chatId }: ChatImageProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ImagesSlice.fetchImage({ id: chatId, type: 'GROUP_CHAT_IMAGE' }));
  }, [dispatch, chatId]);
  const url = useSelector((state: RootState) => ImagesSlice.selectImage(state, 'GROUP_CHAT_IMAGE', chatId, 'ORIGINAL'));
  const error = useSelector((state: RootState) => ImagesSlice.selectError(state, 'GROUP_CHAT_IMAGE', chatId));
  if (error instanceof NonexistentChatError) {
    message.warning("You're no longer in this chat.", 5);
    dispatch(ChatPageLayoutSlice.update({ type: 'EMPTY' }));
  }
  if (url === undefined) return <Spin size='small' />;
  else if (url === null) return <Typography.Text>No group chat image set.</Typography.Text>;
  else return <OriginalImage type='CHAT_IMAGE' url={url} />;
}
