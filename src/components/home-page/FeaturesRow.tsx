import React, { ReactElement } from 'react';
import { Col, Divider, Image, List, Row, Space, Typography } from 'antd';
import {
  CommentOutlined,
  GroupOutlined,
  MessageOutlined,
  PhoneOutlined,
  RobotOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import femaleAvatarImage from '../../images/female-avatar.svg';
import onlineDiscussionImage from '../../images/online-discussion.svg';
import groupChatImage from '../../images/group-chat.svg';
import videoCallImage from '../../images/video-call.svg';
import messagingFunImage from '../../images/messaging-fun.svg';
import securityImage from '../../images/security.svg';

export default function FeaturesRow(): ReactElement {
  return (
    <>
      <Divider>
        <Typography.Title level={3}>Features</Typography.Title>
      </Divider>
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
    </>
  );
}

function UsersRow(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={12} push={2}>
        <Typography.Title level={4}>
          <Space>
            <TeamOutlined /> Users
          </Space>
        </Typography.Title>
        <List>
          <List.Item>Search for your friends and family.</List.Item>
          <List.Item>Use on any device - no phone required.</List.Item>
          <List.Item>See whether a user is online, or when they were last online.</List.Item>
          <List.Item>Block and unblock users without them knowing.</List.Item>
        </List>
      </Col>
      <Col span={4} push={2}>
        <Image preview={false} src={femaleAvatarImage} alt='Female avatar' />
      </Col>
    </Row>
  );
}

function ChatsRow(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={6}>
        <Image preview={false} src={onlineDiscussionImage} alt='Online discussion' />
      </Col>
      <Col span={12}>
        <Typography.Title level={4}>
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
          <List.Item>See which users are currently typing in a chat.</List.Item>
        </List>
      </Col>
    </Row>
  );
}

function GroupChatsRow(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={12} push={1}>
        <Typography.Title level={4}>
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
      <Col span={6} pull={2}>
        <Image preview={false} src={groupChatImage} alt='Group chat' />
      </Col>
    </Row>
  );
}

function FreeCallsRow(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={7} push={2}>
        <Image preview={false} src={videoCallImage} alt='Video call' />
      </Col>
      <Col span={12} push={5}>
        <Typography.Title level={4}>
          <Space>
            <PhoneOutlined /> Free Calls
          </Space>
        </Typography.Title>
        <List>
          <List.Item>Group audio calls.</List.Item>
          <List.Item>Group video calls.</List.Item>
          <List.Item>Screen sharing.</List.Item>
          <List.Item>Background noise cancellation.</List.Item>
          <List.Item>Spatial audio calls for gamers.</List.Item>
        </List>
      </Col>
    </Row>
  );
}

function PowerfulMessagesRow(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={12}>
        <Typography.Title level={4}>
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
          <List.Item>See when the message was sent, delivered, and read by each user.</List.Item>
          <List.Item>Delete messages.</List.Item>
          <List.Item>Bookmark important messages to easily view them later.</List.Item>
          <List.Item>
            Format messages using Markdown (e.g., &quot;**Hello**&quot; displays as &quot;
            <Typography.Text strong>Hello</Typography.Text>
            &quot;).
          </List.Item>
          <List.Item>Reply to a message to prevent context loss.</List.Item>
        </List>
      </Col>
      <Col span={8}>
        <Image preview={false} src={messagingFunImage} alt='Messaging fun' />
      </Col>
    </Row>
  );
}

function ExtensibleRow(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={9}>
        <Image preview={false} src={securityImage} alt='Security' />
      </Col>
      <Col span={12}>
        <Typography.Title level={4}>
          <Space>
            <RobotOutlined /> Extensible
          </Space>
        </Typography.Title>
        <List itemLayout='vertical'>
          <List.Item>
            <Typography.Paragraph>Omni Chat can be self-hosted.</Typography.Paragraph>
            <Typography.Paragraph>
              Citizens of countries which actively block foreign services (e.g., China, Pakistan) can still use it since
              they can easily run their own server which will obviously be hosted on a different domain, port, etc.
              which the government cannot easily block.
            </Typography.Paragraph>
            <Typography.Paragraph>
              Organizations dealing with sensitive data can self-host. Signups can be restricted to users with email
              address domains allowed by the admin (e.g., john@company.example.com could be allowed but not
              john@gmail.com).
            </Typography.Paragraph>
            <Typography.Paragraph>
              The organization may choose to run the service behind their firewall for additional security. This way,
              employees can&apos;t leak information after-hours, hackers won&apos;t get access to the service, and
              employees can&apos;t be the target of identity theft (e.g., they may have their laptop unlocked while they
              go to a café’s restroom, or a thief may steal their phone).
            </Typography.Paragraph>
            <Typography.Paragraph>
              Here are the instructions to{' '}
              <Typography.Link href='https://github.com/neelkamath/omni-chat-web' target='_blank'>
                run your own instance
              </Typography.Link>
              .
            </Typography.Paragraph>
          </List.Item>
          <List.Item>
            Create and use bots which give power to restaurant owners, customer service representatives, DevOps teams,
            etc. Bots can have buttons so that integrations can easily execute code. For example, if a Travis CI build
            fails, a bot could message the specifics on the group with a button, which when clicked, automatically
            reruns the CI/CD pipeline.
          </List.Item>
          <List.Item>
            This project is open-source, and allows bots and UI integrations to be{' '}
            <Typography.Link href='/developers'>built</Typography.Link>.
          </List.Item>
        </List>
      </Col>
    </Row>
  );
}
