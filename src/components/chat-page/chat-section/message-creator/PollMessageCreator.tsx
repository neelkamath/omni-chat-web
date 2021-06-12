import React, { ReactElement, useState } from 'react';
import { Button, Divider, Form, message, Space } from 'antd';
import { MessageText, queryOrMutate } from '@neelkamath/omni-chat';
import GfmFormItem from '../../GfmFormItem';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { Storage } from '../../../../Storage';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

export interface PollMessageCreatorProps {
  readonly chatId: number;
}

interface CreatePollMessageFormData {
  readonly title: string;
  readonly options: Option[] | undefined;
}

interface Option {
  readonly option: string;
}

export default function PollMessageCreator({ chatId }: PollMessageCreatorProps): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const onFinish = async (data: CreatePollMessageFormData) => {
    setLoading(true);
    await operateCreatePollMessage(chatId, data);
    setLoading(false);
  };
  return (
    <Form name='createPollMessage' onFinish={onFinish}>
      <GfmFormItem
        rules={[{ required: true, message: 'Enter the title.' }]}
        minLength={1}
        maxLength={10_000}
        name='title'
        placeholder='Where should we meet?'
        label='Title'
      />
      <Divider />
      <Form.List name='options'>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, fieldKey }, index) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                <GfmFormItem
                  name={[name, 'option']}
                  fieldKey={[fieldKey, 'option']}
                  rules={[{ required: true, message: 'Enter the option.' }]}
                  label={`Option ${index + 1}`}
                  placeholder='Mall'
                  minLength={1}
                  maxLength={10_000}
                />
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                Add option
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

async function operateCreatePollMessage(chatId: number, { title, options }: CreatePollMessageFormData): Promise<void> {
  if (options === undefined || options.length < 2) {
    message.error('Enter at least two options.', 5);
    return;
  }
  const poll = { title: title.trim(), options: options.map(({ option }) => option.trim()) };
  if (poll.title.length === 0) message.error('Enter a title.', 3);
  else if (poll.options.find((option) => option.length === 0) !== undefined)
    message.error('Options must contain characters other than spaces.', 5);
  else if (new Set(poll.options).size < poll.options.length) message.error('Each option must be unique.', 5);
  else await createPollMessage(chatId, poll);
}

interface CreatePollMessageResult {
  readonly createTextMessage: InvalidChatId | InvalidMessageId | InvalidPoll | null;
}

interface InvalidChatId {
  readonly __typename: 'InvalidChatId';
}

interface InvalidMessageId {
  readonly __typename: 'InvalidMessageId';
}

interface InvalidPoll {
  readonly __typename: 'InvalidPoll';
}

interface PollInput {
  readonly title: MessageText;
  readonly options: MessageText[];
}

async function createPollMessage(chatId: number, poll: PollInput): Promise<CreatePollMessageResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation CreatePollMessage($chatId: Int!, $poll: PollInput!) {
              createPollMessage(chatId: $chatId, poll: $poll) {
                __typename
              }
            }
          `,
          variables: { chatId, poll },
        },
        Storage.readAccessToken()!,
      ),
  );
}
