import React, {ReactElement, useEffect, useState} from 'react';
import {Spin} from 'antd';
import * as queriesApi from '../../api/wrappers/queriesApi';
import {Chat, GroupChat, PrivateChat} from '../../api/networking/graphql/models';
import {ChatPageLayoutContext} from '../../contexts/chatPageLayoutContext';
import PrivateChatSection from './PrivateChatSection';
import GroupChatSection from './GroupChatSection';

export interface ChatSectionProps {
    readonly chatId: number;
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function ChatSection({chatId}: ChatSectionProps): ReactElement {
    const [section, setSection] = useState(<Spin style={{padding: 16}}/>);
    useEffect(() => {
        readChat(chatId).then((chat) => {
            if (chat?.__typename === 'PrivateChat') setSection(<PrivateChatSection chat={chat as PrivateChat}/>);
            else if (chat?.__typename === 'GroupChat') setSection(<GroupChatSection chat={chat as GroupChat}/>);
        });
    }, [chatId]);
    return section;
}

async function readChat(id: number): Promise<Chat | undefined> {
    const privateChatMessagesPagination = {last: 10};
    const groupChatMessagesPagination = {last: 10};
    const groupChatUsersPagination = {first: 0};
    return await queriesApi.readChat(
        id,
        privateChatMessagesPagination,
        groupChatUsersPagination,
        groupChatMessagesPagination,
    );
}
