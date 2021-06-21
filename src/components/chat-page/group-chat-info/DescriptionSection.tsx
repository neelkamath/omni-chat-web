import React, { ReactElement, useEffect, useState } from 'react';
import { Button, Divider, Form, message, Spin, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { GroupChatDescription, queryOrMutate } from '@neelkamath/omni-chat';
import { RootState } from '../../../store/store';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { Storage } from '../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import GfmFormItem from '../GfmFormItem';

export interface DescriptionSectionProps {
  readonly chatId: number;
}

export default function DescriptionSection({ chatId }: DescriptionSectionProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChat(chatId));
  }, [dispatch, chatId]);
  const isAdmin = useSelector((state: RootState) => ChatsSlice.selectIsAdmin(state, chatId, Storage.readUserId()!));
  const description = useSelector((state: RootState) => ChatsSlice.selectGroupChatDescription(state, chatId));
  if (isAdmin === undefined || description === undefined) return <Spin />;
  if (isAdmin) return <UpdateDescriptionForm chatId={chatId} />;
  if (description.length === 0) return <></>;
  return (
    <>
      <Divider />
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
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ChatsSlice.fetchChat(chatId));
  }, [dispatch, chatId]);
  const [isLoading, setLoading] = useState(false);
  const description = useSelector((state: RootState) => ChatsSlice.selectGroupChatDescription(state, chatId));
  if (description === undefined) return <Spin />;
  const onFinish = async ({ description }: UpdateGroupChatDescriptionFormData) => {
    setLoading(true);
    await operateUpdateGroupChatDescription(chatId, description);
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

async function operateUpdateGroupChatDescription(chatId: number, description: string): Promise<void> {
  const response = await updateGroupChatDescription(chatId, description.trim());
  if (response?.updateGroupChatDescription === null) message.success('Description updated.', 3);
  else if (response?.updateGroupChatDescription.__typename === 'MustBeAdmin')
    message.error('You must be an admin to update the description.', 5);
}

interface UpdateGroupChatDescriptionResult {
  readonly updateGroupChatDescription: MustBeAdmin | null;
}

interface MustBeAdmin {
  readonly __typename: 'MustBeAdmin';
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
              updateGroupChatDescription(chatId: $chatId, description: $description) {
                __typename
              }
            }
          `,
          variables: { chatId, description },
        },
        Storage.readAccessToken()!,
      ),
  );
}
