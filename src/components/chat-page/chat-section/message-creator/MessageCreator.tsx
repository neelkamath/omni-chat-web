import React, { ReactElement, useState } from 'react';
import { Col, Dropdown, Menu, Row, Space } from 'antd';
import {
  AudioOutlined,
  EditOutlined,
  FileOutlined,
  MessageOutlined,
  PictureOutlined,
  SoundOutlined,
  TableOutlined,
  VideoCameraAddOutlined,
} from '@ant-design/icons';
import TextMessageCreator from './TextMessageCreator';
import PollMessageCreator from './PollMessageCreator';
import FileMessageCreator from './MediaMessageCreator';
import AudioRecorderMessageCreator from './AudioRecorderMessageCreator';

export interface MessageCreatorProps {
  readonly chatId: number;
}

export default function MessageCreator({ chatId }: MessageCreatorProps): ReactElement {
  const [creator, setCreator] = useState(<TextMessageCreator chatId={chatId} />);
  const menu = (
    <Menu>
      <Menu.Item key={1} onClick={() => setCreator(<TextMessageCreator chatId={chatId} />)}>
        <TextItem />
      </Menu.Item>
      <Menu.Item key={2} onClick={() => setCreator(<FileMessageCreator chatId={chatId} type='IMAGE' />)}>
        <ImagesItem />
      </Menu.Item>
      <Menu.Item key={3} onClick={() => setCreator(<FileMessageCreator chatId={chatId} type='DOC' />)}>
        <DocumentsItem />
      </Menu.Item>
      <Menu.Item key={4} onClick={() => setCreator(<FileMessageCreator chatId={chatId} type='VIDEO' />)}>
        <VideosItem />
      </Menu.Item>
      <Menu.Item key={5} onClick={() => setCreator(<AudioRecorderMessageCreator chatId={chatId} />)}>
        <AudioRecorderItem />
      </Menu.Item>
      <Menu.Item key={6} onClick={() => setCreator(<FileMessageCreator chatId={chatId} type='AUDIO' />)}>
        <AudiosItem />
      </Menu.Item>
      <Menu.Item key={7} onClick={() => setCreator(<PollMessageCreator chatId={chatId} />)}>
        <PollItem />
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

function TextItem(): ReactElement {
  return (
    <Space>
      <EditOutlined /> Text
    </Space>
  );
}

function ImagesItem(): ReactElement {
  return (
    <Space>
      <PictureOutlined /> Images
    </Space>
  );
}

function DocumentsItem(): ReactElement {
  return (
    <Space>
      <FileOutlined /> Documents
    </Space>
  );
}

function VideosItem(): ReactElement {
  return (
    <Space>
      <VideoCameraAddOutlined /> Videos
    </Space>
  );
}

function AudiosItem(): ReactElement {
  return (
    <Space>
      <AudioOutlined /> Audios
    </Space>
  );
}

function AudioRecorderItem(): ReactElement {
  return (
    <Space>
      <SoundOutlined /> Record
    </Space>
  );
}

function PollItem(): ReactElement {
  return (
    <Space>
      <TableOutlined /> Poll
    </Space>
  );
}
