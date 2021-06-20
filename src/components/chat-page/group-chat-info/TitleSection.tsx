import React, { ReactElement, useEffect, useState } from 'react';
import { Button, Form, Input, message, Spin, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { GroupChatTitle, queryOrMutate } from '@neelkamath/omni-chat';
import { RootState } from '../../../store/store';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { Storage } from '../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../api';

export interface TitleSectionProps {
  readonly chatId: number;
}

export default function TitleSection({ chatId }: TitleSectionProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChat(chatId));
  }, [dispatch, chatId]);
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
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChat(chatId));
  }, [dispatch, chatId]);
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
    if (response?.updateGroupChatTitle === null) message.success('Title updated.', 3);
    else if (response?.updateGroupChatTitle.__typename === 'MustBeAdmin')
      message.error('You must be an admin to update the title.', 5);
  }
}

interface UpdateGroupChatTitleResult {
  readonly updateGroupChatTitle: MustBeAdmin | null;
}

interface MustBeAdmin {
  readonly __typename: 'MustBeAdmin';
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
              updateGroupChatTitle(chatId: $chatId, title: $title) {
                __typename
              }
            }
          `,
          variables: { chatId, title },
        },
        Storage.readAccessToken()!,
      ),
  );
}
