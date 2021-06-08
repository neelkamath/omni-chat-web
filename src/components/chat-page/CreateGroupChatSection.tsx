import React, { ReactElement, useState } from 'react';
import { Button, Form, Input, message, Radio, Space, Tooltip, Typography } from 'antd';
import { GroupChatDescription, GroupChatTitle, queryOrMutate } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../api';
import { Storage } from '../../Storage';
import { ChatPageLayoutSlice } from '../../store/slices/ChatPageLayoutSlice';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';

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
      <Form.Item name='title' label='Title' rules={[{ required: true, message: "Enter the chat's name." }]}>
        <Input placeholder='Fashion' maxLength={70} minLength={1} />
      </Form.Item>
      <PublicityRadioGroup />
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

function PublicityRadioGroup(): ReactElement {
  const title = (
    <Typography.Paragraph>
      If you choose <Typography.Text strong>not invitable</Typography.Text> or{' '}
      <Typography.Text strong>invitable</Typography.Text>, you can switch between them any number of times after the
      chat has been created but you cannot change it to <Typography.Text strong>public</Typography.Text>. If you choose{' '}
      <Typography.Text strong>public</Typography.Text>, the publicity can never be changed.
    </Typography.Paragraph>
  );
  const label = (
    <Tooltip color='white' title={title} placement='right'>
      <Space>
        Publicity <QuestionCircleOutlined />
      </Space>
    </Tooltip>
  );
  return (
    <Form.Item name='publicity' label={label} rules={[{ required: true }]}>
      <Radio.Group>
        <NotInvitableRadio />
        <InvitableRadio />
        <PublicRadio />
      </Radio.Group>
    </Form.Item>
  );
}

function NotInvitableRadio(): ReactElement {
  return (
    <Radio value='NOT_INVITABLE'>
      <Space>
        Not invitable
        <Tooltip
          color='white'
          title={<Typography.Text>Users cannot join the chat via an invite code.</Typography.Text>}
          placement='right'
        >
          <QuestionCircleOutlined />
        </Tooltip>
      </Space>
    </Radio>
  );
}

function InvitableRadio(): ReactElement {
  return (
    <Radio value='INVITABLE'>
      <Space>
        Invitable
        <Tooltip
          color='white'
          title={<Typography.Text>Users can join the chat via an invite code.</Typography.Text>}
          placement='right'
        >
          <QuestionCircleOutlined />
        </Tooltip>
      </Space>
    </Radio>
  );
}

function PublicRadio(): ReactElement {
  return (
    <Radio value='PUBLIC'>
      <Space>
        Public
        <Tooltip
          color='white'
          title={
            <Typography.Text>
              People can search for, and view public chats without an account. Invite codes are permanently turned on.
              Anyone with an account can join a public chat. The publicity cannot be changed later on.
            </Typography.Text>
          }
          placement='right'
        >
          <QuestionCircleOutlined />
        </Tooltip>
      </Space>
    </Radio>
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
    message.error("The title must contain at least one character which isn't a space.", 5);
    return false;
  }
  return true;
}

async function operateCreateGroupChat(chat: GroupChatInput): Promise<number | undefined> {
  const result = await createGroupChat(chat);
  return result?.createGroupChat.__typename === 'CreatedChatId' ? result.createGroupChat.chatId : undefined;
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
