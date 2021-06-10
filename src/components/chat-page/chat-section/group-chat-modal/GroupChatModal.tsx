import React, { ReactElement } from 'react';
import { Collapse, Divider, Modal, Row } from 'antd';
import PicSection from './pic-section/PicSection';
import StatementSection from './StatementSection';
import BroadcastSection from './BroadcastSection';
import PublicitySection from './PublicitySection';
import LeaveSection from './LeaveSection';
import { useSelector } from 'react-redux';
import { RootState, useThunkDispatch } from '../../../../store/store';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import { Storage } from '../../../../Storage';
import AddUsersSection from './AddUsersSection';
import RemoveUsersSection from './RemoveUsersSection';

export interface GroupChatModalProps {
  /** Whether the modal is visible. */
  readonly isVisible: boolean;
  /** Callback for when the user attempts to close the modal. You could set {@link isVisible} to `false` here. */
  readonly onCancel: () => void;
  readonly chatId: number;
}

export default function GroupChatModal({ isVisible, onCancel, chatId }: GroupChatModalProps): ReactElement {
  return (
    <Modal footer={null} visible={isVisible} onCancel={onCancel}>
      <GroupChatSection chatId={chatId} />
    </Modal>
  );
}

interface GroupChatSectionProps {
  readonly chatId: number;
}

function GroupChatSection({ chatId }: GroupChatSectionProps): ReactElement {
  return (
    <Row style={{ padding: 16 }}>
      <PicSection chatId={chatId} />
      <Divider />
      <StatementSection type='TITLE' chatId={chatId} />
      <Divider />
      <StatementSection type='DESCRIPTION' chatId={chatId} />
      <Divider />
      <BroadcastSection chatId={chatId} />
      <Divider />
      <PublicitySection chatId={chatId} />
      <Divider />
      <UsersAccordion chatId={chatId} />
      <Divider />
      <LeaveSection chatId={chatId} />
    </Row>
  );
}

interface UsersAccordionProps {
  readonly chatId: number;
}

function UsersAccordion({ chatId }: UsersAccordionProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const isAdmin = useSelector((state: RootState) => ChatsSlice.selectIsAdmin(state, chatId, Storage.readUserId()!));
  return (
    <Collapse accordion ghost>
      {isAdmin && (
        <Collapse.Panel header='Add users' key={1}>
          <AddUsersSection chatId={chatId} />
        </Collapse.Panel>
      )}
      {isAdmin && (
        <Collapse.Panel header='Remove users' key={2}>
          <RemoveUsersSection chatId={chatId} />
        </Collapse.Panel>
      )}
    </Collapse>
  );
}
