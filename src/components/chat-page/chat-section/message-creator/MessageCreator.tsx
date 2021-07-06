import React, { ReactElement, useState } from 'react';
import { Col, Dropdown, Menu, Row, Space } from 'antd';
import { EditOutlined, MessageOutlined, PictureOutlined, TableOutlined } from '@ant-design/icons';
import PicMessageCreator from './PicMessageCreator';
import TextMessageCreator from './TextMessageCreator';
import PollMessageCreator from './PollMessageCreator';

export interface MessageCreatorProps {
  readonly chatId: number;
}

export default function MessageCreator({ chatId }: MessageCreatorProps): ReactElement {
  const [creator, setCreator] = useState(<TextMessageCreator chatId={chatId} />);
  const menu = (
    <Menu>
      <Menu.Item key={1} onClick={() => setCreator(<TextMessageCreator chatId={chatId} />)}>
        <Space>
          <EditOutlined /> Text
        </Space>
      </Menu.Item>
      <Menu.Item key={2} onClick={() => setCreator(<PicMessageCreator chatId={chatId} />)}>
        <Space>
          <PictureOutlined /> Picture
        </Space>
      </Menu.Item>
      <Menu.Item key={3} onClick={() => setCreator(<PollMessageCreator chatId={chatId} />)}>
        <Space>
          <TableOutlined /> Poll
        </Space>
      </Menu.Item>
    </Menu>
  );
  return (
    <Row gutter={16}>
      <Col span={23}>{creator}</Col>
      <Col span={1}>
        <Dropdown overlay={menu}>
          <MessageOutlined style={{ fontSize: 24 }} />
        </Dropdown>
      </Col>
    </Row>
  );
}
