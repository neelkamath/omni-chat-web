import {Empty, Layout} from 'antd';
import React, {ReactElement, useEffect, useState} from 'react';
import * as storage from '../../storage';
import {displayConnectionError, UNAUTHORIZED_ERROR} from '../../api/errors';
import * as queries from '../../api/graphQlApi/queries';
import {logOut} from '../../logOut';
import ChatPageMenu from './chatPageMenu';
import LoadingPage from './loadingPage';

export default function ChatPage(): ReactElement {
    const [page, setPage] = useState(<LoadingPage/>);
    useEffect(() => {
        refreshTokenSet().then(() => setPage(<ChatPageLayout/>));
        // noinspection JSIgnoredPromiseFromCall
        Notification.requestPermission();
    }, []);
    return page;
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

/**
 * Ensures the token set saved to {@link localStorage} is always valid. If the currently saved token set either doesn't
 * exist or is invalid, the user will be logged out.
 */
async function refreshTokenSet(): Promise<void> {
    const refreshToken = storage.readTokenSet()?.refreshToken;
    if (refreshToken === undefined) {
        logOut();
        return;
    }
    let tokenSet;
    try {
        tokenSet = await queries.refreshTokenSet(refreshToken);
    } catch (error) {
        error === UNAUTHORIZED_ERROR ? logOut() : await displayConnectionError();
        return;
    }
    storage.saveTokenSet(tokenSet);
    const fiftyMinutes = 50 * 60 * 1000;
    setTimeout(refreshTokenSet, fiftyMinutes);
}
