import React, { ReactElement, useEffect } from 'react';
import { Button, Collapse, Divider, Row } from 'antd';
import ImageSection from './image-section/ImageSection';
import TitleSection from './TitleSection';
import DescriptionSection from './DescriptionSection';
import BroadcastSection from './BroadcastSection';
import PublicitySection from './PublicitySection';
import LeaveSection from './LeaveSection';
import { RootState } from '../../../store/store';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Storage } from '../../../Storage';
import UsersSection from './UsersSection';
import AddUsersSection from './AddUsersSection';
import RemoveUsersSection from './RemoveUsersSection';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ChatPageLayoutSlice } from '../../../store/slices/ChatPageLayoutSlice';
import InviteSection from './InviteSection';
import MakeAdminsSection from './MakeAdminsSection';

export interface GroupChatSectionProps {
  readonly chatId: number;
}

export default function GroupChatInfo({ chatId }: GroupChatSectionProps): ReactElement {
  const dispatch = useDispatch();
  return (
    <Row style={{ padding: 16 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => dispatch(ChatPageLayoutSlice.update({ type: 'CHAT_SECTION', chatId }))}
      >
        Chat
      </Button>
      <InviteSection chatId={chatId} />
      <ImageSection chatId={chatId} />
      <Divider />
      <TitleSection chatId={chatId} />
      <DescriptionSection chatId={chatId} />
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

// TODO: Paginate the sections.
function UsersAccordion({ chatId }: UsersAccordionProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChat(chatId));
  }, [dispatch, chatId]);
  const isAdmin = useSelector((state: RootState) => ChatsSlice.selectIsAdmin(state, chatId, Storage.readUserId()!));
  return (
    <Collapse accordion ghost>
      <Collapse.Panel key={0} header='Participants'>
        <UsersSection chatId={chatId} />
      </Collapse.Panel>
      {isAdmin && (
        <>
          <Collapse.Panel key={1} header='Add users'>
            <AddUsersSection chatId={chatId} />
          </Collapse.Panel>
          <Collapse.Panel key={2} header='Remove users'>
            <RemoveUsersSection chatId={chatId} />
          </Collapse.Panel>
          <Collapse.Panel key={3} header='Make admins'>
            <MakeAdminsSection chatId={chatId} />
          </Collapse.Panel>
        </>
      )}
    </Collapse>
  );
}
