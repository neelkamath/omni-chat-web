import React, { ReactElement, useState } from 'react';
import { Form, Input, Space, Tabs, Tooltip, Typography } from 'antd';
import { EditOutlined, EyeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

/**
 * The {@link value} and {@link setValue} must be the first and second array elements returned by a call to
 * {@link useState} respectively.
 */
export interface GfmFormItemProps {
  readonly value: string;
  readonly setValue: (newValue: string) => void;
  readonly placeholder?: string;
  readonly maxLength: number;
  readonly name: string;
  readonly label?: string;
  /**
   * If `undefined`, then pressing the "return" key creates a line break. Otherwise, pressing the "Enter" key triggers
   * this function, and a line break can only be created by pressing "shift+return".
   */
  readonly onPressEnter?: () => void;
}

/**
 * Despite being a {@link Form.Item}, it's value is always `undefined` when the form gets submitted. So, you must
 * manually use the {@link GfmFormItemProps.value} you passed.
 * @example
 * ```
 * const [bio, setBio] = useState('');
 * const onFinish = async (data) => { // Assume the <name> was entered as "John", and the <bio> was entered as "Dev".
 *   console.log(data); // Prints <{ name: 'John', bio: undefined }>.
 *   console.log({ ...data, bio }); // Prints <{ name: 'John', bio: 'Dev' }>.
 * };
 * const form = (
 *   <Form onFinish={onFinish} name='updateAccount' layout='vertical'>
 *     <Form.Item name='name' label='Name'>
 *       <Input maxLength={30} />
 *     </Form.Item>
 *     <GfmFormItem value={bio} setValue={setBio} maxLength={2_500} name='bio' label='Bio' />
 *     <Form.Item>
 *       <Button type='primary' htmlType='submit' loading={isLoading}>
 *         Submit
 *       </Button>
 *     </Form.Item>
 *   </Form>
 * );
 * ```
 */
export default function GfmFormItem({
  value,
  setValue,
  placeholder,
  maxLength,
  name,
  label,
  onPressEnter,
}: GfmFormItemProps): ReactElement {
  const [isShiftDown, setShiftDown] = useState(false);
  return (
    <Form.Item name={name} label={label}>
      <Tabs tabBarExtraContent={<TabBarExtraContent isForm={onPressEnter !== undefined} />}>
        <Tabs.TabPane tab={<EditTab />} key={1}>
          <Input.TextArea
            placeholder={placeholder}
            maxLength={maxLength}
            value={value}
            autoSize={{ minRows: 1, maxRows: 5 }}
            onChange={({ target }) => {
              const char = target.value[target.value.length - 1];
              if (char !== '\n' || onPressEnter === undefined || (isShiftDown && char === '\n')) setValue(target.value);
            }}
            onPressEnter={() => {
              if (onPressEnter !== undefined && !isShiftDown) onPressEnter();
            }}
            onKeyDownCapture={({ shiftKey }) => {
              if (shiftKey) setShiftDown(true);
            }}
            onKeyUpCapture={({ shiftKey }) => {
              if (shiftKey) setShiftDown(false);
            }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane style={{ width: 300 }} tab={<ViewTab />} key={2}>
          <ReactMarkdown plugins={[gfm]}>{value === undefined ? '' : value}</ReactMarkdown>
        </Tabs.TabPane>
      </Tabs>
    </Form.Item>
  );
}

interface TabBarExtraContentProps {
  readonly isForm: boolean;
}

function TabBarExtraContent({ isForm }: TabBarExtraContentProps): ReactElement {
  const title = (
    <>
      <Typography.Paragraph>
        Uses GitHub Flavored{' '}
        <Typography.Link target='_blank' href='https://commonmark.org/help/'>
          Markdown
        </Typography.Link>
        .
      </Typography.Paragraph>
      {isForm && (
        <Typography.Paragraph>
          Press <Typography.Text keyboard>return</Typography.Text> to submit.
        </Typography.Paragraph>
      )}
      {isForm && (
        <Typography.Paragraph>
          Press <Typography.Text keyboard>shift+return</Typography.Text> to go to the next line.
        </Typography.Paragraph>
      )}
    </>
  );
  return (
    <Tooltip title={title} color='white' placement='topRight'>
      <QuestionCircleOutlined />
    </Tooltip>
  );
}

function EditTab(): ReactElement {
  return (
    <Space>
      <EditOutlined />
      Edit
    </Space>
  );
}

function ViewTab(): ReactElement {
  return (
    <Space>
      <EyeOutlined />
      View
    </Space>
  );
}
