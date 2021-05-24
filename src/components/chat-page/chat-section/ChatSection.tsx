import React, { ReactElement, useEffect, useState } from 'react';
import { Empty, message, Spin } from 'antd';
import PrivateChatSection from './private-chat-section/PrivateChatSection';
import GroupChatSection from './GroupChatSection';
import { Storage } from '../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import { useSelector } from 'react-redux';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { RootState } from '../../../store/store';
import { Bio, DateTime, MessageText, Name, queryOrMutate, Username } from '@neelkamath/omni-chat';

export interface ChatSectionProps {
  readonly chatId: number;
}

export default function ChatSection({ chatId }: ChatSectionProps): ReactElement {
  const [section, setSection] = useState(<Spin style={{ padding: 16 }} />);
  const isDeletedPrivateChat = useSelector((state: RootState) => ChatsSlice.selectIsDeletedPrivateChat(state, chatId));
  const onDeletedChat = () => {
    message.warning('This chat has just been deleted.', 5);
    setSection(<Empty />);
  };
  useEffect(() => {
    if (isDeletedPrivateChat) onDeletedChat();
  }, [isDeletedPrivateChat]);
  useEffect(() => {
    readChat(chatId).then((result) => {
      switch (result?.readChat.__typename) {
        case 'PrivateChat':
          setSection(<PrivateChatSection chat={result.readChat as PrivateChat} />);
          break;
        case 'GroupChat':
          setSection(<GroupChatSection chat={result.readChat as GroupChat} />);
          break;
        case 'InvalidChatId':
        case undefined:
          onDeletedChat();
      }
    });
  }, [chatId]);
  return section;
}

interface ReadChatResult {
  readonly readChat: Chat | InvalidChatId;
}

export interface Chat {
  readonly __typename: 'PrivateChat' | 'GroupChat';
  readonly chatId: number;
  readonly messages: MessagesConnection;
}

export interface MessagesConnection {
  readonly edges: MessageEdge[];
}

export interface MessageEdge {
  readonly node: Message;
}

export interface Message {
  readonly __typename:
    | 'TextMessage'
    | 'ActionMessage'
    | 'PicMessage'
    | 'PollMessage'
    | 'AudioMessage'
    | 'DocMessage'
    | 'GroupChatInviteMessage'
    | 'VideoMessage';
  readonly messageId: number;
  readonly sent: DateTime;
}

export interface TextMessage extends Message {
  readonly __typename: 'TextMessage';
  readonly textMessage: MessageText;
}

export interface PrivateChat extends Chat {
  readonly __typename: 'PrivateChat';
  readonly user: Account;
}

export interface Account {
  readonly userId: number;
  readonly username: Username;
  readonly firstName: Name;
  readonly lastName: Name;
  readonly emailAddress: string;
  readonly bio: Bio;
}

export interface GroupChat extends Chat {
  readonly __typename: 'GroupChat';
  readonly publicity: GroupChatPublicity;
  readonly isBroadcast: boolean;
}

export type GroupChatPublicity = 'INVITABLE' | 'NOT_INVITABLE' | 'PUBLIC';

interface InvalidChatId {
  readonly __typename: 'InvalidChatId';
}

async function readChat(id: number): Promise<ReadChatResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            query ReadChat($id: Int!, $last: Int) {
              readChat(id: $id) {
                __typename
                ... on Chat {
                  chatId
                  messages(last: $last) {
                    edges {
                      node {
                        __typename
                        sent
                        messageId
                        ... on TextMessage {
                          textMessage
                        }
                      }
                    }
                  }
                }
                ... on PrivateChat {
                  user {
                    userId
                    username
                    firstName
                    lastName
                    emailAddress
                    bio
                  }
                }
                ... on GroupChat {
                  publicity
                  isBroadcast
                }
              }
            }
          `,
          variables: { id, last: 10 },
        },
        Storage.readAccessToken(),
      ),
  );
}
