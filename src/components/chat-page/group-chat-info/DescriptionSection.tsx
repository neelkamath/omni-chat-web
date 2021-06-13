import React, { ReactElement, useState } from 'react';
import { Button, Form, message, Spin, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { GroupChatDescription, Placeholder, queryOrMutate } from '@neelkamath/omni-chat';
import { RootState, useThunkDispatch } from '../../../store/store';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { Storage } from '../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import GfmFormItem from '../GfmFormItem';

export interface DescriptionSectionProps {
  readonly chatId: number;
}

export default function DescriptionSection({ chatId }: DescriptionSectionProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const isAdmin = useSelector((state: RootState) => ChatsSlice.selectIsAdmin(state, chatId, Storage.readUserId()!));
  const description = useSelector((state: RootState) => ChatsSlice.selectGroupChatDescription(state, chatId));
  if (isAdmin) return <UpdateDescriptionForm chatId={chatId} />;
  return (
    <>
      <Typography.Text strong>Description</Typography.Text>: {description}
    </>
  );
}

interface UpdateDescriptionFormProps {
  readonly chatId: number;
}

interface UpdateGroupChatDescriptionFormData {
  readonly description: string;
}

function UpdateDescriptionForm({ chatId }: UpdateDescriptionFormProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const [isLoading, setLoading] = useState(false);
  const description = useSelector((state: RootState) => ChatsSlice.selectGroupChatDescription(state, chatId));
  if (description === undefined) return <Spin />;
  const onFinish = async ({ description }: UpdateGroupChatDescriptionFormData) => {
    setLoading(true);
    const response = await updateGroupChatDescription(chatId, description.trim());
    if (response !== undefined) message.success('Description updated.', 3);
    setLoading(false);
  };
  return (
    <Form onFinish={onFinish} layout='vertical' name='updateGroupChatDescription'>
      <GfmFormItem maxLength={1_000} name='description' label='Description' initialValue={description} />
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Update
        </Button>
      </Form.Item>
    </Form>
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
