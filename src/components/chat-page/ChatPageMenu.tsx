import { Button, Col, Dropdown, Menu, Row, Tooltip } from 'antd';
import React, { ReactElement } from 'react';
import {
  CodeOutlined,
  ContactsOutlined,
  CustomerServiceOutlined,
  LogoutOutlined,
  MoreOutlined,
  SearchOutlined,
  StopOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import logOut from '../../logOut';
import MenuChats from './menu-chats/MenuChats';
import { useDispatch, useSelector } from 'react-redux';
import { PicsSlice } from '../../store/slices/PicsSlice';
import { RootState, useThunkDispatch } from '../../store/store';
import { Storage } from '../../Storage';
import CustomPic from './CustomPic';
import { NonexistentUserIdError } from '@neelkamath/omni-chat';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';
import { SearchedUsersSlice } from '../../store/slices/SearchedUsersSlice';

export default function ChatPageMenu(): ReactElement {
  return (
    <>
      <Row gutter={16} justify='space-around' style={{ padding: 16 }}>
        <EditAccountCol />
        <ContactsCol />
        <SearchUsersCol />
        <CreateGroupChatCol />
        <BlockedUsersCol />
        <LogOutCol />
        <MoreCol />
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
          icon={<CustomPic icon={<UserOutlined />} url={url} size='small' />}
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
            dispatch(SearchedUsersSlice.clear());
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
          onClick={() => {
            dispatch(SearchedUsersSlice.clear());
            dispatch(ChatPageLayoutSlice.update({ type: 'SEARCH_USERS_SECTION' }));
          }}
        />
      </Tooltip>
    </Col>
  );
}

function CreateGroupChatCol(): ReactElement {
  const dispatch = useDispatch();
  return (
    <Col>
      <Tooltip title='Create group chat'>
        <Button
          icon={<UsergroupAddOutlined />}
          onClick={() => {
            dispatch(ChatPageLayoutSlice.update({ type: 'CREATE_GROUP_CHAT' }));
          }}
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
          onClick={() => {
            dispatch(SearchedUsersSlice.clear());
            dispatch(ChatPageLayoutSlice.update({ type: 'BLOCKED_USERS_SECTION' }));
          }}
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

function SupportItem(): ReactElement {
  const dispatch = useDispatch();
  return (
    <Button
      icon={<CustomerServiceOutlined />}
      onClick={() => dispatch(ChatPageLayoutSlice.update({ type: 'SUPPORT_SECTION' }))}
    >
      Support
    </Button>
  );
}

function DevelopersItem(): ReactElement {
  const dispatch = useDispatch();
  return (
    <Button
      icon={<CodeOutlined />}
      onClick={() => dispatch(ChatPageLayoutSlice.update({ type: 'DEVELOPERS_SECTION' }))}
    >
      Developers
    </Button>
  );
}

function MoreCol(): ReactElement {
  const menu = (
    <Menu>
      <Menu.Item>
        <SupportItem />
      </Menu.Item>
      <Menu.Item>
        <DevelopersItem />
      </Menu.Item>
    </Menu>
  );
  return (
    <Col>
      <Dropdown overlay={menu}>
        <Button icon={<MoreOutlined />} />
      </Dropdown>
    </Col>
  );
}