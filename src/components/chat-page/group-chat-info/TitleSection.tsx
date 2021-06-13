import React, { ReactElement, useState } from 'react';
import { Button, Form, Input, message, Spin, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { GroupChatTitle, Placeholder, queryOrMutate } from '@neelkamath/omni-chat';
import { RootState, useThunkDispatch } from '../../../store/store';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { Storage } from '../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../api';

export interface TitleSectionProps {
  readonly chatId: number;
}

export default function TitleSection({ chatId }: TitleSectionProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const isAdmin = useSelector((state: RootState) => ChatsSlice.selectIsAdmin(state, chatId, Storage.readUserId()!));
  const title = useSelector((state: RootState) => ChatsSlice.selectGroupChatTitle(state, chatId));
  if (isAdmin) return <UpdateTitleForm chatId={chatId} />;
  return (
    <>
      <Typography.Text strong>Title</Typography.Text>: {title}
    </>
  );
}

interface UpdateTitleFormData {
  readonly title: string;
}

interface UpdateTitleFormProps {
  readonly chatId: number;
}

function UpdateTitleForm({ chatId }: UpdateTitleFormProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const [isLoading, setLoading] = useState(false);
  const title = useSelector((state: RootState) => ChatsSlice.selectGroupChatTitle(state, chatId));
  if (title === undefined) return <Spin />;
  const onFinish = async (data: UpdateTitleFormData) => {
    setLoading(true);
    await operateUpdateGroupChatTitle(chatId, data.title.trim());
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} name='updateGroupChatTitle' layout='inline'>
      <Form.Item name='title' label='Title' initialValue={title}>
        <Input maxLength={70} minLength={1} />
      </Form.Item>
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Update
        </Button>
      </Form.Item>
    </Form>
  );
}

async function operateUpdateGroupChatTitle(chatId: number, title: GroupChatTitle): Promise<void> {
  if (title.length === 0) message.error("The title must contain at least one character which isn't a space.", 5);
  else {
    const response = await updateGroupChatTitle(chatId, title);
    if (response !== undefined) message.success('Title updated.', 3);
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
