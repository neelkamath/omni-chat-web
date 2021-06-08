import React, { ReactElement, useState } from 'react';
import { Button, Form, Input, message, Spin, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { GroupChatDescription, GroupChatTitle, Placeholder, queryOrMutate } from '@neelkamath/omni-chat';
import store, { RootState, useThunkDispatch } from '../../../../store/store';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import { Storage } from '../../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';

export type SectionType = 'TITLE' | 'DESCRIPTION';

export interface StatementSectionProps {
  readonly chatId: number;
  readonly type: SectionType;
}

export default function StatementSection({ chatId, type }: StatementSectionProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const isAdmin = useSelector((state: RootState) => ChatsSlice.selectIsAdmin(state, chatId, Storage.readUserId()!));
  let name, data;
  switch (type) {
    case 'TITLE':
      name = 'Title';
      data = ChatsSlice.selectGroupChatTitle(store.getState(), chatId);
      break;
    case 'DESCRIPTION':
      name = 'Description';
      data = ChatsSlice.selectGroupChatDescription(store.getState(), chatId);
  }
  if (isAdmin) return <UpdateSectionForm chatId={chatId} type={type} />;
  return (
    <>
      <Typography.Text strong>{name}</Typography.Text>: {data}
    </>
  );
}

interface UpdateSectionFormData {
  readonly data: string;
}

interface UpdateSectionFormProps {
  readonly chatId: number;
  readonly type: SectionType;
}

function UpdateSectionForm({ chatId, type }: UpdateSectionFormProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const [isLoading, setLoading] = useState(false);
  let name, data, maxLength, minLength;
  switch (type) {
    case 'TITLE':
      name = 'title';
      maxLength = 70;
      minLength = 1;
      data = ChatsSlice.selectGroupChatTitle(store.getState(), chatId);
      break;
    case 'DESCRIPTION':
      name = 'description';
      maxLength = 1_000;
      minLength = 0;
      data = ChatsSlice.selectGroupChatDescription(store.getState(), chatId);
  }
  if (data === undefined) return <Spin />;
  const onFinish = async (form: UpdateSectionFormData) => {
    setLoading(true);
    const newData = form.data.trim();
    switch (type) {
      case 'TITLE':
        if (newData.length === 0)
          message.error("The title must contain at least one character which isn't a space.", 5);
        else {
          const result = await updateGroupChatTitle(chatId, newData);
          if (result !== undefined) message.success('Title updated.', 3);
        }
        break;
      case 'DESCRIPTION': {
        const result = await updateGroupChatDescription(chatId, newData);
        if (result !== undefined) message.success('Description updated.', 3);
      }
    }
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name='updateGroupChatTitle' layout='inline'>
      <Form.Item name='data' label={name[0]!.toUpperCase() + name.slice(1)} initialValue={data}>
        <Input maxLength={maxLength} minLength={minLength} />
      </Form.Item>
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Update
        </Button>
      </Form.Item>
    </Form>
  );
}

interface UpdateGroupChatTitleResult {
  readonly updateGroupChatTitle: Placeholder;
}

async function updateGroupChatTitle(
  chatId: number,
  title: GroupChatTitle,
): Promise<UpdateGroupChatTitleResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation UpdateGroupChatTitle($chatId: Int!, $title: GroupChatTitle!) {
              updateGroupChatTitle(chatId: $chatId, title: $title)
            }
          `,
          variables: { chatId, title },
        },
        Storage.readAccessToken()!,
      ),
  );
}

interface UpdateGroupChatDescriptionResult {
  readonly updateGroupChatDescription: Placeholder;
}

async function updateGroupChatDescription(
  chatId: number,
  description: GroupChatDescription,
): Promise<UpdateGroupChatDescriptionResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation UpdateGroupChatDescription($chatId: Int!, $description: GroupChatDescription!) {
              updateGroupChatDescription(chatId: $chatId, description: $description)
            }
          `,
          variables: { chatId, description },
        },
        Storage.readAccessToken()!,
      ),
  );
}
