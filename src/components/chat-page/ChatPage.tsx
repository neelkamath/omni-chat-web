import { Empty, Layout, message, Row, Spin } from 'antd';
import React, { ReactElement, useEffect, useState } from 'react';
import ChatPageMenu from './ChatPageMenu';
import { setUpSubscriptions } from '../../subscriptions/manager';
import { Storage } from '../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { useSelector } from 'react-redux';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';
import AccountEditor from './account-editor/AccountEditor';
import SearchUsersSection from './SearchUsersSection';
import ChatPageSupportSection from './ChatPageSupportSection';
import DevelopersSection from '../DevelopersSection';
import ChatSection from './chat-section/ChatSection';
import { queryOrMutate } from '@neelkamath/omni-chat';
import setOnline from '../../setOnline';
import CreateGroupChatSection from './CreateGroupChatSection';
import SearchPublicChatsSection from './SearchPublicChatsSection';
import GroupChatInfo from './group-chat-info/GroupChatInfo';
import logOut from '../../logOut';

export default function ChatPage(): ReactElement {
  const [page, setPage] = useState(<LoadingPage />);
  useEffect(() => {
    refreshTokenSet().then(async (response) => {
      if (response === undefined) {
        const setOnlineStatus = false;
        await logOut(setOnlineStatus);
        return;
      }
      Storage.saveTokenSet(response.refreshTokenSet);
      await setOnline(true);
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

interface RefreshTokenSetResult {
  readonly refreshTokenSet: Storage.TokenSet;
}

async function refreshTokenSet(): Promise<RefreshTokenSetResult | undefined> {
  const logOutOnUnauthorizedError = false;
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(httpApiConfig, {
        query: `
          query RefreshTokenSet($refreshToken: ID!) {
            refreshTokenSet(refreshToken: $refreshToken) {
              accessToken
              refreshToken
            }
          }
        `,
        variables: { refreshToken: Storage.readRefreshToken() },
      }),
    logOutOnUnauthorizedError,
  );
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
    <Layout style={{ minHeight: '100%' }}>
      <Layout.Sider theme='light' width={425}>
        <ChatPageMenu />
      </Layout.Sider>
      <Layout.Content>
        <LayoutContent />
      </Layout.Content>
    </Layout>
  );
}

// TODO: Continue testing the app from here.
function LayoutContent(): ReactElement {
  const { type, chatId } = useSelector(ChatPageLayoutSlice.select);
  switch (type) {
    case 'EMPTY':
      return <Empty style={{ padding: 24 }} />;
    case 'BLOCKED_USERS_SECTION':
      return <SearchUsersSection type='BLOCKED_USERS' />;
    case 'ACCOUNT_EDITOR':
      return <AccountEditor />;
    case 'CONTACTS_SECTION':
      return <SearchUsersSection type='CONTACTS' />;
    case 'SEARCH_USERS_SECTION':
      return <SearchUsersSection type='USERS' />;
    case 'SUPPORT_SECTION':
      return <ChatPageSupportSection />;
    case 'DEVELOPERS_SECTION':
      return <DevelopersSection />;
    case 'CHAT_SECTION':
      return <ChatSection chatId={chatId!} />;
    case 'CREATE_GROUP_CHAT':
      return <CreateGroupChatSection />;
    case 'SEARCH_PUBLIC_CHATS':
      return <SearchPublicChatsSection />;
    case 'GROUP_CHAT_INFO':
      return <GroupChatInfo chatId={chatId!} />;
  }
}
