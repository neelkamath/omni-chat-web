import { Empty, Layout, message, Row, Spin } from 'antd';
import React, { ReactElement, useEffect, useState } from 'react';
import ChatPageMenu from './ChatPageMenu';
import { setUpSubscriptions } from '../../store/subscriptions';
import { Storage } from '../../Storage';
import { refreshTokenSet, setOnline } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { useSelector } from 'react-redux';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';
import BlockedUsersSection from './BlockedUsersSection';
import AccountEditor from './account-editor/AccountEditor';
import ContactsSection from './ContactsSection';
import SearchUsersSection from './SearchUsersSection';
import ChatPageSupportSection from './ChatPageSupportSection';
import DevelopersSection from '../DevelopersSection';
import ChatSection from './chat-section/ChatSection';

export default function ChatPage(): ReactElement {
  const [page, setPage] = useState(<LoadingPage />);
  useEffect(() => {
    operateGraphQlApi(() => refreshTokenSet(httpApiConfig, Storage.readRefreshToken()!)).then(async (result) => {
      if (result === undefined) {
        location.href = '/sign-in';
        return;
      }
      Storage.saveTokenSet(result.refreshTokenSet);
      // TODO: Test once Omni Chat Backend 0.18.0 releases.
      await operateGraphQlApi(() => setOnline(httpApiConfig, Storage.readAccessToken()!, true));
      await setUpSubscriptions();
      addEventListener('online', () => {
        if (location.pathname === '/chat')
          message.warning('Refresh the page to view updates you missed while offline.', 5);
      });
      setPage(<ChatPageLayout />);
    });
    Notification.requestPermission();
  }, []);
  return page;
}

function LoadingPage(): ReactElement {
  return (
    <Row style={{ position: 'absolute', top: '50%', left: '50%' }}>
      <Spin size='large' />
    </Row>
  );
}

function ChatPageLayout(): ReactElement {
  return (
    <Layout style={{ height: '100%' }}>
      <Layout.Sider theme='light' width={425}>
        <ChatPageMenu />
      </Layout.Sider>
      <Layout.Content>
        <LayoutContent />
      </Layout.Content>
    </Layout>
  );
}

function LayoutContent(): ReactElement {
  const { type, chatId } = useSelector(ChatPageLayoutSlice.select);
  switch (type) {
    case 'EMPTY':
      return <Empty style={{ padding: 24 }} />;
    case 'BLOCKED_USERS_SECTION':
      return <BlockedUsersSection />;
    case 'ACCOUNT_EDITOR':
      return <AccountEditor />;
    case 'CONTACTS_SECTION':
      return <ContactsSection />;
    case 'SEARCH_USERS_SECTION':
      return <SearchUsersSection />;
    case 'CHAT_PAGE_SUPPORT_SECTION':
      return <ChatPageSupportSection />;
    case 'DEVELOPERS_SECTION':
      return <DevelopersSection />;
    case 'CHAT_SECTION':
      return <ChatSection chatId={chatId!} />;
  }
}
