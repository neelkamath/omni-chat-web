import { Button, Col, Row, Tooltip } from 'antd';
import React, { ReactElement, useContext } from 'react';
import ChatPageSupportSection from './ChatPageSupportSection';
import { ChatPageLayoutContext } from '../../chatPageLayoutContext';
import {
  CodeOutlined,
  ContactsOutlined,
  CustomerServiceOutlined,
  LogoutOutlined,
  SearchOutlined,
  StopOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import AccountEditor from './account-editor/AccountEditor';
import SearchUsersSection from './SearchUsersSection';
import logOut from '../../logOut';
import DevelopersSection from '../DevelopersSection';
import ContactsSection from './ContactsSection';
import BlockedUsersSection from './BlockedUsersSection';
import MenuChats from './chat-section/MenuChats/MenuChats';
import { useDispatch, useSelector } from 'react-redux';
import { SearchedContactsSlice } from '../../store/slices/SearchedContactsSlice';
import { PicsSlice } from '../../store/slices/PicsSlice';
import { RootState, useThunkDispatch } from '../../store/store';
import { Storage } from '../../Storage';
import CustomAvatar from './CustomAvatar';
import { NonexistentUserError } from '@neelkamath/omni-chat';

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
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

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function EditAccountCol(): ReactElement {
  const { setContent } = useContext(ChatPageLayoutContext)!;
  useThunkDispatch(PicsSlice.fetchPic({ type: 'PROFILE_PIC', id: Storage.readUserId()! }));
  const url = useSelector((state: RootState) =>
    PicsSlice.selectPic(state, 'PROFILE_PIC', Storage.readUserId()!, 'THUMBNAIL'),
  );
  const error = useSelector((state: RootState) => PicsSlice.selectError(state, 'PROFILE_PIC', Storage.readUserId()!));
  if (error instanceof NonexistentUserError) {
    const mustSetOffline = false;
    logOut(mustSetOffline);
  }
  return (
    <Col>
      <Tooltip title='Edit account'>
        <Button
          icon={<CustomAvatar icon={<UserDeleteOutlined />} url={url} size='small' />}
          onClick={() => setContent(<AccountEditor />)}
        />
      </Tooltip>
    </Col>
  );
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function ContactsCol(): ReactElement {
  const { setContent } = useContext(ChatPageLayoutContext)!;
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
            setContent(<ContactsSection />);
          }}
        />
      </Tooltip>
    </Col>
  );
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function SearchUsersCol(): ReactElement {
  const { setContent } = useContext(ChatPageLayoutContext)!;
  return (
    <Col>
      <Tooltip title='Search users'>
        <Button icon={<SearchOutlined />} onClick={() => setContent(<SearchUsersSection />)} />
      </Tooltip>
    </Col>
  );
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function BlockedUsersCol(): ReactElement {
  const { setContent } = useContext(ChatPageLayoutContext)!;
  return (
    <Col>
      <Tooltip title='Blocked users'>
        <Button icon={<StopOutlined />} onClick={() => setContent(<BlockedUsersSection />)} />
      </Tooltip>
    </Col>
  );
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function SupportCol(): ReactElement {
  const { setContent } = useContext(ChatPageLayoutContext)!;
  return (
    <Col>
      <Tooltip title='Support'>
        <Button icon={<CustomerServiceOutlined />} onClick={() => setContent(<ChatPageSupportSection />)} />
      </Tooltip>
    </Col>
  );
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function DevelopersCol(): ReactElement {
  const { setContent } = useContext(ChatPageLayoutContext)!;
  return (
    <Col>
      <Tooltip title='Developers'>
        <Button icon={<CodeOutlined />} onClick={() => setContent(<DevelopersSection />)} />
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
