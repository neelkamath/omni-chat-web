import React, { ReactElement, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { Button, Divider, Modal, Spin } from 'antd';
import { ShareAltOutlined } from '@ant-design/icons';
import { Storage } from '../../../Storage';
import SendableChats from '../SendableChats';

export interface InviteSectionProps {
  readonly chatId: number;
}

export default function InviteSection({ chatId }: InviteSectionProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChat(chatId));
  }, [dispatch, chatId]);
  const publicity = useSelector((state: RootState) => ChatsSlice.selectPublicity(state, chatId));
  const participants = useSelector((state: RootState) => ChatsSlice.selectParticipants(state, chatId));
  const [isVisible, setVisible] = useState(false);
  if (publicity === undefined || participants === undefined) return <Spin />;
  if (!participants.includes(Storage.readUserId()!) || publicity === 'NOT_INVITABLE') return <></>;
  return (
    <>
      <Divider />
      <Button icon={<ShareAltOutlined />} onClick={() => setVisible(true)}>
        Invite
      </Button>
      <Modal visible={isVisible} onCancel={() => setVisible(false)} footer={null}>
        <SendableChats chatId={chatId} type='GROUP_CHAT_INVITATION' />
      </Modal>
    </>
  );
}
