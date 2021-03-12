import React, {ReactElement} from 'react';
import {Col, Divider, Image, List, Row, Space, Typography} from 'antd';
import femaleAvatarImage from '../images/female-avatar.svg';
import onlineDiscussionImage from '../images/online-discussion.svg';
import groupChatImage from '../images/group-chat.svg';
import videoCallImage from '../images/video-call.svg';
import messagingFunImage from '../images/messaging-fun.svg';
import securityImage from '../images/security.svg';
import coverImage from '../images/cover.png';
import HomeLayout from './HomeLayout';
import {
  CommentOutlined,
  GroupOutlined,
  MessageOutlined,
  PhoneOutlined,
  RobotOutlined,
  TeamOutlined,
} from '@ant-design/icons';

export default function HomePage(): ReactElement {
  return (
    <HomeLayout>
      <Space direction="vertical">
        <Image preview={false} src={coverImage} alt="Cover" />
        <Row gutter={16} justify="space-around">
          <Col>
            <Typography.Title level={2}>Trusted, Extensible, Better Chat</Typography.Title>
          </Col>
        </Row>
        <Row gutter={16} style={{padding: 16}}>
          <UsersRow />
          <Divider />
          <ChatsRow />
          <Divider />
          <GroupChatsRow />
          <Divider />
          <FreeCallsRow />
          <Divider />
          <PowerfulMessagesRow />
          <Divider />
          <ExtensibleRow />
        </Row>
      </Space>
    </HomeLayout>
  );
}

function UsersRow(): ReactElement {
  return (
    <Row gutter={16} justify="space-around" align="middle">
      <Col span={12}>
        <Typography.Title level={3}>
          <Space>
            <TeamOutlined /> Users
          </Space>
        </Typography.Title>
        <List>
          <List.Item>Search for your friends and family.</List.Item>
          <List.Item>Use on any device - no phone required.</List.Item>
          <List.Item>Automatic online status.</List.Item>
          <List.Item>Block and unblock users without them knowing.</List.Item>
        </List>
      </Col>
      <Col span={4}>
        <Image preview={false} src={femaleAvatarImage} alt="Female avatar" />
      </Col>
    </Row>
  );
}

function ChatsRow(): ReactElement {
  return (
    <Row gutter={16} justify="space-around" align="middle">
      <Col span={6}>
        <Image preview={false} src={onlineDiscussionImage} alt="Online discussion" />
      </Col>
      <Col span={12}>
        <Typography.Title level={3}>
          <Space>
            <CommentOutlined /> Chats
          </Space>
        </Typography.Title>
        <List>
          <List.Item>Private chats.</List.Item>
          <List.Item>Group chats.</List.Item>
          <List.Item>
            Broadcast chats where only admins can message. This option can be toggled for a chat any time. This is for
            chats for updates, like a conference&apos;s chat where you don&apos;t want hundreds of people asking the
            same questions over and over again.
          </List.Item>
          <List.Item>
            Public chats such as an official Android chat, random groups individuals have created, and a Mario Kart
            chat. People can search for, and view public chats without an account. Anyone with an account can join them.
          </List.Item>
        </List>
      </Col>
    </Row>
  );
}

function GroupChatsRow(): ReactElement {
  return (
    <Row gutter={16} justify="space-around" align="middle">
      <Col span={12}>
        <Typography.Title level={3}>
          <Space>
            <GroupOutlined /> Group Chats
          </Space>
        </Typography.Title>
        <List>
          <List.Item>Chat description and icon.</List.Item>
          <List.Item>Multiple admins.</List.Item>
          <List.Item>Newly added participants can view previously sent messages.</List.Item>
          <List.Item>Unlimited participants.</List.Item>
          <List.Item>Invite codes.</List.Item>
        </List>
      </Col>
      <Col span={6}>
        <Image preview={false} src={groupChatImage} alt="Group chat" />
      </Col>
    </Row>
  );
}

function FreeCallsRow(): ReactElement {
  return (
    <Row gutter={16} justify="space-around" align="middle">
      <Col span={7}>
        <Image preview={false} src={videoCallImage} alt="Video call" />
      </Col>
      <Col span={12}>
        <Typography.Title level={3}>
          <Space>
            <PhoneOutlined /> Free Calls
          </Space>
        </Typography.Title>
        <List>
          <List.Item>Group audio calls.</List.Item>
          <List.Item>Group video calls.</List.Item>
          <List.Item>Screen sharing.</List.Item>
          <List.Item>Background noise cancellation for both audio and video calls.</List.Item>
          <List.Item>Spatial audio calls for gamers.</List.Item>
        </List>
      </Col>
    </Row>
  );
}

function PowerfulMessagesRow(): ReactElement {
  return (
    <Row gutter={16} justify="space-around" align="middle">
      <Col span={12}>
        <Typography.Title level={3}>
          <Space>
            <MessageOutlined /> Powerful Messages
          </Space>
        </Typography.Title>
        <List>
          <List.Item>
            Send texts, audio, pictures, videos, polls, documents, group chat invites, and actions (buttons which
            trigger third-party server-side code such as ordering food via a bot).
          </List.Item>
          <List.Item>Forward messages.</List.Item>
          <List.Item>Search messages.</List.Item>
          <List.Item>See when the message was sent, delivered, and read.</List.Item>
          <List.Item>Delete messages.</List.Item>
          <List.Item>Star messages.</List.Item>
          <List.Item>Markdown support.</List.Item>
          <List.Item>Reply to a message to prevent context loss.</List.Item>
        </List>
      </Col>
      <Col span={8}>
        <Image preview={false} src={messagingFunImage} alt="Messaging fun" />
      </Col>
    </Row>
  );
}

function ExtensibleRow(): ReactElement {
  return (
    <Row gutter={16} justify="space-around" align="middle">
      <Col span={9}>
        <Image preview={false} src={securityImage} alt="Security" />
      </Col>
      <Col span={12}>
        <Typography.Title level={3}>
          <Space>
            <RobotOutlined /> Extensible
          </Space>
        </Typography.Title>
        <List>
          <List.Item>
            Omni Chat can be deployed for private use as well. For example, a company may only want to use it as an
            internal platform, in which case they can specify that only certain email address domains can create
            accounts. This way, even if an intruder gets into the company&apos;s network, they won&apos;t be able to
            create an account since they won&apos;t have a company issued email address. This feature also prevents
            employees from creating an account with their personal email address. Here are the instructions to{' '}
            <Typography.Link href="https://github.com/neelkamath/omni-chat-web" target="_blank">
              run your own instance
            </Typography.Link>
            .
          </List.Item>
          <List.Item>
            Create and use bots which give power to restaurant owners, customer service representatives, DevOps teams,
            etc. Bots can have buttons so that integrations can easily execute code. For example, if a Travis CI build
            fails, a bot could message the specifics on the group with a button, which when clicked, automatically
            reruns the CI/CD pipeline.
          </List.Item>
          <List.Item>This project is open-source, and allows bots and UI integrations to be built.</List.Item>
        </List>
      </Col>
    </Row>
  );
}
