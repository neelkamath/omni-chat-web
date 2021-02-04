import React, {ReactElement} from 'react';
import {Message, TextMessage} from '../../api/networking/graphql/models';
import {Comment} from 'antd';

export interface ChatMessageProps {
    readonly message: Message;
}

// TODO
export default function ChatMessage({message}: ChatMessageProps): ReactElement {
    return <Comment content={(message as TextMessage).message} datetime={message.dateTimes.sent}/>;
}
