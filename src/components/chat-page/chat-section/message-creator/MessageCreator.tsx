import React, { ReactElement, useState } from 'react';
import { Dropdown, Menu, Space } from 'antd';
import { EditOutlined, MessageOutlined, PictureOutlined } from '@ant-design/icons';
import PicMessageCreator from './PicMessageCreator';
import TextMessageCreator from './TextMessageCreator';

export interface MessageCreatorProps {
  readonly chatId: number;
}

// FIXME: Doesn't re-render when <chatId> changes.
export default function MessageCreator({ chatId }: MessageCreatorProps): ReactElement {
  const [creator, setCreator] = useState(<TextMessageCreator chatId={chatId} />);
  const style = { fontSize: 24 };
  const menu = (
    <Menu>
      <Menu.Item key={1} onClick={() => setCreator(<TextMessageCreator chatId={chatId} />)}>
        <Space>
          <EditOutlined style={style} /> Text
        </Space>
      </Menu.Item>
      <Menu.Item key={2} onClick={() => setCreator(<PicMessageCreator chatId={chatId} />)}>
        <Space>
          <PictureOutlined style={style} /> Picture
        </Space>
      </Menu.Item>
    </Menu>
  );
  return (
    <Space>
      <Dropdown overlay={menu}>
        <MessageOutlined style={style} />
      </Dropdown>
      {creator}
    </Space>
  );
}
