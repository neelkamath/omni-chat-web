import {Empty, Layout, Row, Spin} from 'antd';
import React, {ReactElement, useEffect, useState} from 'react';
import * as queriesApi from '../api/wrappers/queriesApi';
import ChatPageMenu from './chat-page-menu/ChatPageMenu';

export default function ChatPage(): ReactElement {
    const [page, setPage] = useState(<LoadingPage/>);
    useEffect(() => {
        queriesApi.refreshTokenSet().then(() => setPage(<ChatPageLayout/>));
        // noinspection JSIgnoredPromiseFromCall
        Notification.requestPermission();
    }, []);
    return page;
}

function LoadingPage(): ReactElement {
    return (
        <Row style={{position: 'absolute', top: '50%', left: '50%'}}>
            <Spin size='large'/>
        </Row>
    );
}

function ChatPageLayout(): ReactElement {
    return (
        <Layout>
            <Layout.Sider>
                <ChatPageMenu/>
            </Layout.Sider>
            <Layout.Content style={{padding: 16}}>
                <Empty/>
            </Layout.Content>
        </Layout>
    );
}
