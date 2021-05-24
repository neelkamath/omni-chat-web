import React, { ReactElement, useState } from 'react';
import { Button, Form, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { isValidMessageTextScalar, MessageText, queryOrMutate } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { Storage } from '../../../../Storage';
import store from '../../../../store/store';
import { ChatPageLayoutSlice } from '../../../../store/slices/ChatPageLayoutSlice';
import GfmFormItem from '../../GfmFormItem';

export interface MessageCreatorProps {
  readonly chatId: number;
}

// TODO: Support replying to a message.
// TODO: Test.
// TODO: Make it look good.
export default function MessageCreator({ chatId }: MessageCreatorProps): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const [value, setValue] = useState('');
  const onFinish = () => {
    setLoading(true);
    const text = value.trim();
    if (isValidMessageTextScalar(text)) {
      const isCreated = operateCreateTextMessage(chatId, text);
      if (isCreated) setValue('');
    } else message.error('Messages must contain characters other than spaces.', 5);
    setLoading(false);
  };
  return (
    <Form
      style={{ position: 'fixed', width: '100%', bottom: 16 }}
      onFinish={onFinish}
      name='createMessage'
      layout='inline'
    >
      <GfmFormItem initialValue={value} onChange={setValue} maxLength={10_000} name='text' onPressEnter={onFinish} />
      <Form.Item>
        <Button loading={isLoading} type='primary' htmlType='submit' icon={<SendOutlined />} />
      </Form.Item>
    </Form>
  );
}

/** @returns Whether the message was sent. */
async function operateCreateTextMessage(chatId: number, text: MessageText): Promise<boolean> {
  const result = await createTextMessage(chatId, text);
  if (result?.createTextMessage === null) return true;
  switch (result?.createTextMessage?.__typename) {
    case 'InvalidChatId':
      message.error('The other user just deleted their account.', 5);
      store.dispatch(ChatPageLayoutSlice.update({ type: 'EMPTY' }));
      break;
    case 'InvalidMessageId':
      message.error('The context message has just been deleted.', 5);
  }
  return false;
}

interface CreateTextMessageResult {
  readonly createTextMessage: InvalidChatId | InvalidMessageId | null;
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
