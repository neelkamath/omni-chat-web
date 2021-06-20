import React, { ReactElement, useState } from 'react';
import { Button, Form, Input, message, Space } from 'antd';
import { GroupChatDescription, GroupChatTitle, queryOrMutate } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { Storage } from '../../Storage';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';
import { useDispatch } from 'react-redux';
import PublicityRadioGroup from './PublicityRadioGroup';

export default function CreateGroupChatSection(): ReactElement {
  return (
    <Space style={{ padding: 16 }} direction='vertical'>
      Create a group chat.
      <CreateGroupChatForm />
    </Space>
  );
}

interface CreateGroupChatFormData {
  readonly title: string;
  readonly publicity: GroupChatPublicity;
}

export type GroupChatPublicity = 'INVITABLE' | 'NOT_INVITABLE' | 'PUBLIC';

function CreateGroupChatForm(): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const onFinish = async (data: CreateGroupChatFormData) => {
    setLoading(true);
    const chat = buildGroupChatInput(data);
    if (validateGroupChatInput(chat)) {
      const chatId = await operateCreateGroupChat(chat);
      setLoading(false);
      if (chatId !== undefined) dispatch(ChatPageLayoutSlice.update({ type: 'CHAT_SECTION', chatId }));
    } else setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name='createGroupChat' layout='vertical' initialValues={{ publicity: 'INVITABLE' }}>
      <Form.Item name='title' label='Title' rules={[{ required: true, message: 'Enter the chat\'s name.' }]}>
        <Input placeholder='Fashion' maxLength={70} minLength={1} />
      </Form.Item>
      <PublicityRadioGroup isRequired />
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

interface GroupChatInput {
  readonly title: GroupChatTitle;
  readonly description: GroupChatDescription;
  readonly userIdList: number[];
  readonly adminIdList: number[];
  readonly isBroadcast: boolean;
  readonly publicity: GroupChatPublicity;
}

function buildGroupChatInput({ title, publicity }: CreateGroupChatFormData): GroupChatInput {
  return { title: title.trim(), description: '', userIdList: [], adminIdList: [], isBroadcast: false, publicity };
}

function validateGroupChatInput({ title }: GroupChatInput): boolean {
  if (title.length === 0) {
    message.error('The title must contain at least one character which isn\'t a space.', 5);
    return false;
  }
  return true;
}

async function operateCreateGroupChat(chat: GroupChatInput): Promise<number | undefined> {
  const response = await createGroupChat(chat);
  return response?.createGroupChat.__typename === 'CreatedChatId' ? response.createGroupChat.chatId : undefined;
}

interface CreateGroupChatResult {
  readonly createGroupChat: CreatedChatId | InvalidAdminId;
}

interface CreatedChatId {
  readonly __typename: 'CreatedChatId';
  readonly chatId: number;
}

interface InvalidAdminId {
  readonly __typename: 'InvalidAdminId';
}

async function createGroupChat(chat: GroupChatInput): Promise<CreateGroupChatResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
          mutation CreateGroupChat($chat: GroupChatInput!) {
            createGroupChat(chat: $chat) {
              __typename
              ... on CreatedChatId {
                chatId
              }
            }
          }
        `,
          variables: { chat },
        },
        Storage.readAccessToken()!,
      ),
  );
}
