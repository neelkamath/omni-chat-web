import React, { ReactElement } from 'react';
import { Form, Radio, RadioChangeEvent, Space, Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

export interface PublicityRadioGroupProps {
  readonly isNotInvitableDisabled?: boolean;
  readonly isInvitableDisabled?: boolean;
  readonly isPublicDisabled?: boolean;
  readonly onChange?: (event: RadioChangeEvent) => void;
  readonly isRequired?: boolean;
}

export default function PublicityRadioGroup({
  onChange,
  isNotInvitableDisabled,
  isInvitableDisabled,
  isPublicDisabled,
  isRequired,
}: PublicityRadioGroupProps): ReactElement {
  return (
    <Form.Item name='publicity' label={<Label />} rules={[{ required: isRequired, message: 'Specify the publicity.' }]}>
      <Radio.Group onChange={onChange}>
        <NotInvitableRadio isDisabled={isNotInvitableDisabled} />
        <InvitableRadio isDisabled={isInvitableDisabled} />
        <PublicRadio isDisabled={isPublicDisabled} />
      </Radio.Group>
    </Form.Item>
  );
}

function Label(): ReactElement {
  const title = (
    <Typography.Paragraph>
      Chats can switch between being <Typography.Text strong>not invitable</Typography.Text> and{' '}
      <Typography.Text strong>invitable</Typography.Text> any number of times but cannot be changed to{' '}
      <Typography.Text strong>public</Typography.Text>. <Typography.Text strong>Public</Typography.Text> chats can never
      have their publicity changed.
    </Typography.Paragraph>
  );
  return (
    <Tooltip color='white' title={title} placement='right'>
      <Space>
        Publicity <QuestionCircleOutlined />
      </Space>
    </Tooltip>
  );
}

interface NotInvitableRadioProps {
  readonly isDisabled?: boolean;
}

function NotInvitableRadio({ isDisabled }: NotInvitableRadioProps): ReactElement {
  return (
    <Radio disabled={isDisabled} value='NOT_INVITABLE'>
      <Space>
        Not invitable
        <Tooltip
          color='white'
          title={<Typography.Text>Users cannot join the chat via an invite code.</Typography.Text>}
          placement='right'
        >
          <QuestionCircleOutlined />
        </Tooltip>
      </Space>
    </Radio>
  );
}

interface InvitableRadioProps {
  readonly isDisabled?: boolean;
}

function InvitableRadio({ isDisabled }: InvitableRadioProps): ReactElement {
  return (
    <Radio disabled={isDisabled} value='INVITABLE'>
      <Space>
        Invitable
        <Tooltip
          color='white'
          title={<Typography.Text>Users can join the chat via an invite code.</Typography.Text>}
          placement='right'
        >
          <QuestionCircleOutlined />
        </Tooltip>
      </Space>
    </Radio>
  );
}

interface PublicRadioProps {
  readonly isDisabled?: boolean;
}

function PublicRadio({ isDisabled }: PublicRadioProps): ReactElement {
  return (
    <Radio disabled={isDisabled} value='PUBLIC'>
      <Space>
        Public
        <Tooltip
          color='white'
          title={
            <Typography.Text>
              People can search for, and view public chats without an account. Invite codes are permanently turned on.
              Anyone with an account can join a public chat.
            </Typography.Text>
          }
          placement='right'
        >
          <QuestionCircleOutlined />
        </Tooltip>
      </Space>
    </Radio>
  );
}
