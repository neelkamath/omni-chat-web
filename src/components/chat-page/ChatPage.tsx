import { Layout, message, Row, Spin } from 'antd';
import React, { ReactElement, useEffect, useState } from 'react';
import ChatPageMenu from './ChatPageMenu';
import { ChatPageLayoutContext, useChatPageLayoutContext } from '../../chatPageLayoutContext';
import { setUpSubscriptions } from '../../store/subscriptions';
import { Storage } from '../../Storage';
import { refreshTokenSet, setOnline } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../api';

export default function ChatPage(): ReactElement {
  const [page, setPage] = useState(<LoadingPage />);
  useEffect(() => {
    operateGraphQlApi(() => refreshTokenSet(httpApiConfig, Storage.readRefreshToken()!)).then(async (result) => {
      if (result === undefined) {
        location.href = '/sign-in';
        return;
      }
      Storage.saveTokenSet(result.refreshTokenSet);
      await operateGraphQlApi(() => setOnline(httpApiConfig, Storage.readAccessToken()!, true)); // TODO: Test.
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
  const context = useChatPageLayoutContext();
  return (
    <Layout style={{ minHeight: '100%' }}>
      <ChatPageLayoutContext.Provider value={context}>
        <Layout.Sider theme='light' width={425}>
          <ChatPageMenu />
        </Layout.Sider>
        <Layout.Content>{context.content}</Layout.Content>
      </ChatPageLayoutContext.Provider>
    </Layout>
  );
}
