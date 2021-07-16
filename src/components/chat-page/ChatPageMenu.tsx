import { Button, Col, Dropdown, Menu, Row, Tooltip } from 'antd';
import React, { ReactElement, useEffect } from 'react';
import {
  CodeOutlined,
  ContactsOutlined,
  CustomerServiceOutlined,
  FileSearchOutlined,
  LogoutOutlined,
  MoreOutlined,
  SearchOutlined,
  StopOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import logOut from '../../logOut';
import MenuChats from './MenuChats';
import { useDispatch, useSelector } from 'react-redux';
import { ImagesSlice } from '../../store/slices/ImagesSlice';
import { Storage } from '../../Storage';
import CustomImage from './CustomImage';
import { NonexistentUserIdError } from '@neelkamath/omni-chat';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';
import { SearchedUsersSlice } from '../../store/slices/SearchedUsersSlice';
import { RootState } from '../../store/store';

export default function ChatPageMenu(): ReactElement {
  return (
    <>
      <Row gutter={16} justify='space-around' style={{ padding: 16 }}>
        <EditAccountCol />
        <ContactsCol />
        <SearchUsersCol />
        <CreateGroupChatCol />
        <SearchPublicChatsCol />
        <MoreCol />
      </Row>
      <MenuChats />
    </>
  );
}

function EditAccountCol(): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ImagesSlice.fetch({ type: 'PROFILE_IMAGE', id: Storage.readUserId()! }));
  }, [dispatch]);
  const url = useSelector((state: RootState) =>
    ImagesSlice.selectImage(state, 'PROFILE_IMAGE', Storage.readUserId()!, 'THUMBNAIL'),
  );
  const error = useSelector((state: RootState) =>
    ImagesSlice.selectError(state, 'PROFILE_IMAGE', Storage.readUserId()!),
  );
  if (error instanceof NonexistentUserIdError) logOut();
  return (
    <Col>
      <Tooltip title='Edit account'>
        <Button
          icon={<CustomImage icon={<UserOutlined />} url={url} size='small' />}
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
            dispatch(ChatPageLayoutSlice.update({ type: 'GROUP_CHAT_CREATOR' }));
          }}
        />
      </Tooltip>
    </Col>
  );
}

function SearchPublicChatsCol(): ReactElement {
  const dispatch = useDispatch();
  return (
    <Col>
      <Tooltip title='Search public chats'>
        <Button
          icon={<FileSearchOutlined />}
          onClick={() => {
            dispatch(ChatPageLayoutSlice.update({ type: 'SEARCH_PUBLIC_CHATS' }));
          }}
        />
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

function LogOutItem(): ReactElement {
  return (
    <Button icon={<LogoutOutlined />} onClick={() => logOut()}>
      Log out
    </Button>
  );
}

function MoreCol(): ReactElement {
  const menu = (
    <Menu>
      <Menu.Item key={0}>
        <BlockedUsersItem />
      </Menu.Item>
      <Menu.Item key={1}>
        <SupportItem />
      </Menu.Item>
      <Menu.Item key={2}>
        <DevelopersItem />
      </Menu.Item>
      <Menu.Item key={3}>
        <LogOutItem />
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

function BlockedUsersItem(): ReactElement {
  const dispatch = useDispatch();
  return (
    <Button
      icon={<StopOutlined />}
      onClick={() => {
        dispatch(SearchedUsersSlice.clear());
        dispatch(ChatPageLayoutSlice.update({ type: 'BLOCKED_USERS_SECTION' }));
      }}
    >
      Blocked users
    </Button>
  );
}
