import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import React, { ReactElement, useState } from 'react';
import { Button, Col, Dropdown, Menu, Modal } from 'antd';
import { Storage } from '../../../../Storage';
import { DeleteOutlined, ExclamationCircleOutlined, ForwardOutlined, MoreOutlined } from '@ant-design/icons';
import SendableChats from '../../SendableChats';
import { Placeholder, queryOrMutate } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';

export interface OptionsProps {
  readonly chatId: number;
  readonly message: ChatsSlice.Message;
}

export default function Options({ chatId, message }: OptionsProps): ReactElement {
  const menu = (
    <Menu>
      <Menu.Item key={0}>
        <ForwardAction chatId={chatId} messageId={message.messageId} />
      </Menu.Item>
      {message.sender.userId === Storage.readUserId() && (
        <Menu.Item key={1}>
          <DeleteAction key={1} message={message} />
        </Menu.Item>
      )}
    </Menu>
  );
  return (
    <Col>
      <Dropdown overlay={menu}>
        <Button icon={<MoreOutlined />} />
      </Dropdown>
    </Col>
  );
}

interface ForwardActionProps {
  readonly chatId: number;
  readonly messageId: number;
}

function ForwardAction({ chatId, messageId }: ForwardActionProps): ReactElement {
  const [isVisible, setVisible] = useState(false);
  return (
    <>
      <Button icon={<ForwardOutlined />} onClick={() => setVisible(true)}>
        Forward
      </Button>
      <Modal visible={isVisible} onCancel={() => setVisible(false)} footer={null}>
        <SendableChats type='FORWARDED_MESSAGE' chatId={chatId} messageId={messageId} />
      </Modal>
    </>
  );
}

interface DeleteActionProps {
  readonly message: ChatsSlice.Message;
}

function DeleteAction({ message }: DeleteActionProps): ReactElement {
  const onClick = () => {
    Modal.confirm({
      title: 'Delete?',
      icon: <ExclamationCircleOutlined />,
      onOk: async () => await deleteMessage(message.messageId),
      okType: 'danger',
    });
  };
  return (
    <Button icon={<DeleteOutlined />} onClick={onClick}>
      Delete
    </Button>
  );
}

interface DeleteMessageResult {
  readonly deleteMessage: Placeholder | null;
}

async function deleteMessage(messageId: number): Promise<DeleteMessageResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation DeleteMessage($id: Int!) {
              deleteMessage(id: $id) {
                __typename
              }
            }
          `,
          variables: { id: messageId },
        },
        Storage.readAccessToken()!,
      ),
  );
}
