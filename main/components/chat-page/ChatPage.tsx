import {Layout, Row, Spin} from 'antd';
import React, {ReactElement, useEffect, useState} from 'react';
import * as queriesApi from '../../api/wrappers/queriesApi';
import ChatPageMenu from './ChatPageMenu';
import {ChatPageLayoutContext, useChatPageLayoutContext} from '../../contexts/chatPageLayoutContext';
import * as mutationsApis from '../../api/wrappers/mutationsApi';

export default function ChatPage(): ReactElement {
    const [page, setPage] = useState(<LoadingPage/>);
    useEffect(() => {
        queriesApi.refreshTokenSet().then(async () => {
            setPage(<ChatPageLayout/>);
            await mutationsApis.setOnlineStatus(true);
        });
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
    const context = useChatPageLayoutContext();
    return (
        <Layout style={{height: '100%'}}>
            <ChatPageLayoutContext.Provider value={context}>
                <Layout.Sider theme='light'>
                    <ChatPageMenu/>
                </Layout.Sider>
                <Layout.Content>{context.content}</Layout.Content>
            </ChatPageLayoutContext.Provider>
        </Layout>
    );
}
