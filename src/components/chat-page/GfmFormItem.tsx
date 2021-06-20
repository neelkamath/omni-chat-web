import React, { ReactElement, useState } from 'react';
import { Form, Input, Space, Tabs, Tooltip, Typography } from 'antd';
import { EditOutlined, EyeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { Rule } from 'antd/lib/form';
import { NamePath } from 'antd/lib/form/interface';

export interface GfmFormItemProps {
  readonly name?: NamePath;
  readonly fieldKey?: React.Key | React.Key[];
  readonly initialValue?: string;
  readonly placeholder?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly label?: string;
  /**
   * If `undefined`, then pressing "return" creates a line break. Otherwise, pressing "return" triggers this function,
   * and the field is cleared, In this case, a line break can only be created by pressing "shift+return".
   */
  readonly onPressEnter?: (value: string) => void;
  readonly rules?: Rule[];
}

// FIXME: Pressing enter doesn't clear the field.
export default function GfmFormItem({
  placeholder,
  maxLength,
  minLength,
  name,
  label,
  fieldKey,
  onPressEnter,
  initialValue,
  rules,
}: GfmFormItemProps): ReactElement {
  const [value, setValue] = useState(initialValue === undefined ? '' : initialValue);
  const [isShiftDown, setShiftDown] = useState(false);
  return (
    <Tabs
      tabBarExtraContent={<TabBarExtraContent hasCustomEnter={onPressEnter !== undefined} />}
      size='small'
      tabPosition='bottom'
    >
      <Tabs.TabPane tab={<EditTab />} key={1}>
        <Form.Item fieldKey={fieldKey} name={name} label={label} initialValue={value} rules={rules}>
          <Input.TextArea
            showCount
            placeholder={placeholder}
            maxLength={maxLength}
            minLength={minLength}
            value={value}
            autoSize={{ minRows: 1, maxRows: 5 }}
            onChange={({ target }) => {
              const char = target.value[target.value.length - 1];
              if (onPressEnter === undefined || char !== '\n' || (isShiftDown && char === '\n')) setValue(target.value);
            }}
            onPressEnter={() => {
              if (onPressEnter !== undefined && !isShiftDown) {
                onPressEnter(value);
                setValue('');
              }
            }}
            onKeyDownCapture={({ shiftKey }) => {
              if (shiftKey) setShiftDown(true);
            }}
            onKeyUpCapture={({ shiftKey }) => {
              if (shiftKey) setShiftDown(false);
            }}
          />
        </Form.Item>
      </Tabs.TabPane>
      <Tabs.TabPane style={{ width: 300 }} tab={<ViewTab />} key={2}>
        <ReactMarkdown plugins={[gfm]}>{value}</ReactMarkdown>
      </Tabs.TabPane>
    </Tabs>
  );
}

interface TabBarExtraContentProps {
  readonly hasCustomEnter: boolean;
}

function TabBarExtraContent({ hasCustomEnter }: TabBarExtraContentProps): ReactElement {
  const title = (
    <>
      <Typography.Paragraph>
        Uses GitHub Flavored{' '}
        <Typography.Link target='_blank' href='https://commonmark.org/help/'>
          Markdown
        </Typography.Link>
        .
      </Typography.Paragraph>
      {hasCustomEnter && (
        <Typography.Paragraph>
          Press <Typography.Text keyboard>return</Typography.Text> to submit.
        </Typography.Paragraph>
      )}
      {hasCustomEnter && (
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
