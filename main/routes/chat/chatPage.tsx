import {Empty, Layout} from 'antd';
import React, {ReactElement, useEffect, useState} from 'react';
import {Storage} from '../../storage';
import {ConnectionError, InternalServerError, UnauthorizedError} from '../../api/errors';
import {logOut} from '../../logOut';
import ChatPageMenu from './chatPageMenu';
import LoadingPage from './loadingPage';
import {Queries} from '../../api/graphQlApi/queries';

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
    const refreshToken = Storage.readTokenSet()?.refreshToken;
    if (refreshToken === undefined) {
        logOut();
        return;
    }
    let tokenSet;
    try {
        tokenSet = await Queries.refreshTokenSet(refreshToken);
    } catch (error) {
        if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) logOut();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    Storage.saveTokenSet(tokenSet);
    const fiftyMinutes = 50 * 60 * 1000;
    setTimeout(refreshTokenSet, fiftyMinutes);
}
