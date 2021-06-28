import React, { ReactElement } from 'react';
import { Form, message } from 'antd';
import { isValidMessageTextScalar, MessageText, queryOrMutate } from '@neelkamath/omni-chat';
import GfmFormItem from '../../GfmFormItem';
import { ChatPageLayoutSlice } from '../../../../store/slices/ChatPageLayoutSlice';
import store from '../../../../store/store';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { Storage } from '../../../../Storage';
import useForm from 'antd/lib/form/hooks/useForm';

export interface TextMessageCreatorProps {
  readonly chatId: number;
}

// FIXME: After sending a text message, the focus on the text field gets lost.
export default function TextMessageCreator({ chatId }: TextMessageCreatorProps): ReactElement {
  const [form] = useForm();
  const onPressEnter = async (text: string) => {
    if (isValidMessageTextScalar(text)) {
      await operateCreateTextMessage(chatId, text);
      form.resetFields();
    } else message.error('Messages must contain characters other than spaces.', 5);
  };
  return (
    <Form name='createTextMessage' form={form}>
      <GfmFormItem minLength={1} maxLength={10_000} name='text' onPressEnter={onPressEnter} />
    </Form>
  );
}

/** Returns whether the message was sent. */
async function operateCreateTextMessage(chatId: number, text: MessageText): Promise<boolean> {
  const response = await createTextMessage(chatId, text);
  if (response?.createTextMessage === null) return true;
  switch (response?.createTextMessage?.__typename) {
    case 'InvalidChatId':
      message.error("You're no longer in this chat.", 5);
      store.dispatch(ChatPageLayoutSlice.update({ type: 'EMPTY' }));
      break;
    case 'InvalidMessageId':
      message.error('The context message has just been deleted.', 5);
      break;
    case 'MustBeAdmin':
      message.error("You must be the chat's admin to create a message.", 5);
  }
  return false;
}

interface CreateTextMessageResult {
  readonly createTextMessage: InvalidChatId | InvalidMessageId | MustBeAdmin | null;
}

interface MustBeAdmin {
  readonly __typename: 'MustBeAdmin';
}

interface InvalidChatId {
  readonly __typename: 'InvalidChatId';
}

interface InvalidMessageId {
  readonly __typename: 'InvalidMessageId';
}

async function createTextMessage(chatId: number, text: MessageText): Promise<CreateTextMessageResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation CreateTextMessage($chatId: Int!, $text: MessageText!) {
              createTextMessage(chatId: $chatId, text: $text) {
                __typename
              }
            }
          `,
          variables: { chatId, text },
        },
        Storage.readAccessToken()!,
      ),
  );
}
