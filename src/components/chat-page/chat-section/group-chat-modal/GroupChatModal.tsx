import React, { ReactElement } from 'react';
import { Divider, Modal, Row } from 'antd';
import PicSection from './pic-section/PicSection';
import StatementSection from './StatementSection';
import BroadcastSection from './BroadcastSection';

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
    </Row>
  );
}
