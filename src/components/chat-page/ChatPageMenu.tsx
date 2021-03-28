import { Button, Col, Row, Tooltip } from 'antd';
import React, { ReactElement } from 'react';
import {
  CodeOutlined,
  ContactsOutlined,
  CustomerServiceOutlined,
  LogoutOutlined,
  SearchOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import logOut from '../../logOut';
import MenuChats from './chat-section/menu-chats/MenuChats';
import { useDispatch, useSelector } from 'react-redux';
import { SearchedContactsSlice } from '../../store/slices/SearchedContactsSlice';
import { PicsSlice } from '../../store/slices/PicsSlice';
import { RootState, useThunkDispatch } from '../../store/store';
import { Storage } from '../../Storage';
import CustomAvatar from './CustomAvatar';
import { NonexistentUserIdError } from '@neelkamath/omni-chat';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';

export default function ChatPageMenu(): ReactElement {
  useThunkDispatch(PicsSlice.fetchPic({ type: 'PROFILE_PIC', id: Storage.readUserId()! }));
  return (
    <>
      <Row gutter={16} justify='space-around' style={{ padding: 16 }}>
        <EditAccountCol />
        <ContactsCol />
        <SearchUsersCol />
        <BlockedUsersCol />
        <SupportCol />
        <DevelopersCol />
        <LogOutCol />
      </Row>
      <MenuChats />
    </>
  );
}

function EditAccountCol(): ReactElement {
  useThunkDispatch(PicsSlice.fetchPic({ type: 'PROFILE_PIC', id: Storage.readUserId()! }));
  const dispatch = useDispatch();
  const url = useSelector((state: RootState) =>
    PicsSlice.selectPic(state, 'PROFILE_PIC', Storage.readUserId()!, 'THUMBNAIL'),
  );
  const error = useSelector((state: RootState) => PicsSlice.selectError(state, 'PROFILE_PIC', Storage.readUserId()!));
  if (error instanceof NonexistentUserIdError) logOut();
  return (
    <Col>
      <Tooltip title='Edit account'>
        <Button
          icon={<CustomAvatar icon={<UserOutlined />} url={url} size='small' />}
          onClick={() => dispatch(ChatPageLayoutSlice.update({ type: 'ACCOUNT_EDITOR' }))}
        />
      </Tooltip>
    </Col>
  );
}

function ContactsCol(): ReactElement {
  const dispatch = useDispatch();
  return (
    <Col>
      <Tooltip title='Contacts'>
        <Button
          icon={<ContactsOutlined />}
          onClick={() => {
            /*
            The contacts page displays each of the user's contacts the first time it's opened. Since the state is
            persisted in Redux, subsequent page opens will display the stale contacts, which is incorrect. By
            clearing the state, the page is forced to fetch the contacts instead of using preexisting stale data.
             */
            dispatch(SearchedContactsSlice.clear());
            dispatch(ChatPageLayoutSlice.update({ type: 'CONTACTS_SECTION' }));
          }}
        />
      </Tooltip>
    </Col>
  );
}

function SearchUsersCol(): ReactElement {
  const dispatch = useDispatch();
  return (
    <Col>
      <Tooltip title='Search users'>
        <Button
          icon={<SearchOutlined />}
          onClick={() => dispatch(ChatPageLayoutSlice.update({ type: 'SEARCH_USERS_SECTION' }))}
        />
      </Tooltip>
    </Col>
  );
}

function BlockedUsersCol(): ReactElement {
  const dispatch = useDispatch();
  return (
    <Col>
      <Tooltip title='Blocked users'>
        <Button
          icon={<StopOutlined />}
          onClick={() => dispatch(ChatPageLayoutSlice.update({ type: 'BLOCKED_USERS_SECTION' }))}
        />
      </Tooltip>
    </Col>
  );
}

function SupportCol(): ReactElement {
  const dispatch = useDispatch();
  return (
    <Col>
      <Tooltip title='Support'>
        <Button
          icon={<CustomerServiceOutlined />}
          onClick={() => dispatch(ChatPageLayoutSlice.update({ type: 'CHAT_PAGE_SUPPORT_SECTION' }))}
        />
      </Tooltip>
    </Col>
  );
}

function DevelopersCol(): ReactElement {
  const dispatch = useDispatch();
  return (
    <Col>
      <Tooltip title='Developers'>
        <Button
          icon={<CodeOutlined />}
          onClick={() => dispatch(ChatPageLayoutSlice.update({ type: 'DEVELOPERS_SECTION' }))}
        />
      </Tooltip>
    </Col>
  );
}

function LogOutCol(): ReactElement {
  return (
    <Col>
      <Tooltip title='Log out'>
        <Button icon={<LogoutOutlined />} onClick={() => logOut()} />
      </Tooltip>
    </Col>
  );
}
