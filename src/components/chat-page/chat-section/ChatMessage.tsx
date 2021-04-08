import React, { ReactElement } from 'react';
import { Comment } from 'antd';
import { Message, TextMessage } from '@neelkamath/omni-chat';

export interface ChatMessageProps {
  readonly message: Message;
}

// TODO
export default function ChatMessage({ message }: ChatMessageProps): ReactElement {
  return <Comment content={(message as TextMessage).textMessage} datetime={message.sent} />;
}
