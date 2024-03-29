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
import GroupChatCreatorSection from './CreateGroupChatSection';
import SearchPublicChatsSection from './SearchPublicChatsSection';
import GroupChatInfo from './group-chat-info/GroupChatInfo';
import logOut from '../../logOut';

export default function ChatPage(): ReactElement {
  const [page, setPage] = useState(<LoadingPage />);
  useEffect(() => {
    const setOnlineStatus = false;
    if (Storage.readRefreshToken() === undefined) {
      logOut(setOnlineStatus);
      return;
    }
    refreshTokenSet().then(async (response) => {
      if (response === undefined) {
        await logOut(setOnlineStatus);
        return;
      }
      Storage.saveTokenSet(response.refreshTokenSet);
      await Promise.all([setOnline(true), setUpSubscriptions()]);
      addEventListener('online', () => {
        if (location.pathname === '/chat')
          message.warning('Refresh the page to view updates you missed while offline.', 5);
      });
      setPage(<ChatPageLayout />);
    });
    // FIXME: Firefox doesn't display notification requests unless the user has interacted with the website.
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

function LayoutContent(): ReactElement {
  const { type, chatId } = useSelector(ChatPageLayoutSlice.select);
  switch (type) {
    case 'EMPTY':
      return <Empty style={{ padding: 24 }} />;
    case 'ACCOUNT_EDITOR':
      return <AccountEditor />;
    case 'CONTACTS_SECTION':
      return <SearchUsersSection displayTitle type='CONTACTS' />;
    case 'BLOCKED_USERS_SECTION':
      return <SearchUsersSection displayTitle type='BLOCKED_USERS' />;
    case 'SEARCH_USERS_SECTION':
      return <SearchUsersSection displayTitle type='USERS' />;
    case 'SUPPORT_SECTION':
      return <ChatPageSupportSection />;
    case 'DEVELOPERS_SECTION':
      return <DevelopersSection />;
    case 'CHAT_SECTION':
      return <ChatSection chatId={chatId!} />;
    case 'GROUP_CHAT_CREATOR':
      return <GroupChatCreatorSection />;
    case 'SEARCH_PUBLIC_CHATS':
      return <SearchPublicChatsSection />;
    case 'GROUP_CHAT_INFO':
      return <GroupChatInfo chatId={chatId!} />;
  }
}
