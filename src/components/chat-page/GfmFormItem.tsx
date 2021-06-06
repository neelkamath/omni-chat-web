import React, { ReactElement, useState } from 'react';
import { Form, Input, Space, Tabs, Tooltip, Typography } from 'antd';
import { EditOutlined, EyeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

export interface GfmFormItemProps {
  readonly value?: string;
  readonly setValue: (newValue: string) => void;
  readonly maxLength: number;
  readonly name: string;
  readonly label?: string;
  readonly onPressEnter?: () => void;
}

export default function GfmFormItem({
  value,
  setValue,
  maxLength,
  name,
  label,
  onPressEnter,
}: GfmFormItemProps): ReactElement {
  const [isShiftDown, setShiftDown] = useState(false);
  return (
    <Form.Item name={name} label={label}>
      <Tabs tabBarExtraContent={<TabBarExtraContent />}>
        <Tabs.TabPane tab={<EditTab />} key={1}>
          <Input.TextArea
            maxLength={maxLength}
            value={value}
            autoSize={{ minRows: 1, maxRows: 5 }}
            onChange={({ target }) => {
              const char = target.value[target.value.length - 1];
              if (char !== '\n' || (isShiftDown && char === '\n')) setValue(target.value);
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

function TabBarExtraContent(): ReactElement {
  const title = (
    <>
      <Typography.Paragraph>
        Uses GitHub Flavored{' '}
        <Typography.Link target='_blank' href='https://commonmark.org/help/'>
          Markdown
        </Typography.Link>
        .
      </Typography.Paragraph>
      <Typography.Paragraph>
        Press <Typography.Text keyboard>return</Typography.Text> to submit.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Press <Typography.Text keyboard>shift+return</Typography.Text> to go to the next line.
      </Typography.Paragraph>
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
