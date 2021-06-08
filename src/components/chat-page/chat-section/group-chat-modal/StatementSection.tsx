import React, { ReactElement, useState } from 'react';
import { Button, Form, Input, message, Spin, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { GroupChatDescription, GroupChatTitle, Placeholder, queryOrMutate } from '@neelkamath/omni-chat';
import { RootState, useThunkDispatch } from '../../../../store/store';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import { Storage } from '../../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';

export interface StatementSectionProps {
  readonly chatId: number;
  readonly type: ChatsSlice.GroupChatStatementType;
}

export default function StatementSection({ chatId, type }: StatementSectionProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const isAdmin = useSelector((state: RootState) => ChatsSlice.selectIsAdmin(state, chatId, Storage.readUserId()!));
  const statement = useSelector((state: RootState) => ChatsSlice.selectGroupChatStatement(state, chatId, type));
  let name;
  switch (type) {
    case 'TITLE':
      name = 'Title';
      break;
    case 'DESCRIPTION':
      name = 'Description';
  }
  if (isAdmin) return <UpdateSectionForm chatId={chatId} type={type} />;
  return (
    <>
      <Typography.Text strong>{name}</Typography.Text>: {statement}
    </>
  );
}

interface UpdateSectionFormData {
  readonly data: string;
}

interface UpdateSectionFormProps {
  readonly chatId: number;
  readonly type: ChatsSlice.GroupChatStatementType;
}

function UpdateSectionForm({ chatId, type }: UpdateSectionFormProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const [isLoading, setLoading] = useState(false);
  const statement = useSelector((state: RootState) => ChatsSlice.selectGroupChatStatement(state, chatId, type));
  const { maxLength, minLength, name } = buildFormData(type);
  if (statement === undefined) return <Spin />;
  const onFinish = async ({ data }: UpdateSectionFormData) => {
    setLoading(true);
    await operateUpdateGroupChatStatement(type, chatId, data.trim());
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name={`updateGroupChat${name}`} layout='inline'>
      <Form.Item name='data' label={name} initialValue={statement}>
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

async function operateUpdateGroupChatStatement(
  type: ChatsSlice.GroupChatStatementType,
  chatId: number,
  data: GroupChatTitle | GroupChatDescription,
): Promise<void> {
  switch (type) {
    case 'TITLE':
      if (data.length === 0) message.error("The title must contain at least one character which isn't a space.", 5);
      else {
        const result = await updateGroupChatTitle(chatId, data);
        if (result !== undefined) message.success('Title updated.', 3);
      }
      break;
    case 'DESCRIPTION': {
      const result = await updateGroupChatDescription(chatId, data);
      if (result !== undefined) message.success('Description updated.', 3);
    }
  }
}

interface FormData {
  readonly name: 'Title' | 'Description';
  readonly minLength: 0 | 1;
  readonly maxLength: 70 | 1_000;
}

function buildFormData(type: ChatsSlice.GroupChatStatementType): FormData {
  switch (type) {
    case 'TITLE':
      return { name: 'Title', maxLength: 70, minLength: 1 };
    case 'DESCRIPTION':
      return { name: 'Description', maxLength: 1_000, minLength: 0 };
  }
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
