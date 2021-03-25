import React, { ReactElement } from 'react';
import { Col, Divider, Image, Row, Space, Typography } from 'antd';
import { AimOutlined, ControlOutlined, PhoneOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import winnersImage from '../../images/winners.svg';
import videoGameNightImage from '../../images/video-game-night.svg';
import upgradeImage from '../../images/upgrade.svg';
import makeupArtistImage from '../../images/makeup-artist.svg';

export default function UserStoriesRow(): ReactElement {
  return (
    <>
      <Divider>
        <Typography.Title level={3}>User Stories</Typography.Title>
      </Divider>
      <OverachieverOtisRow />
      <Divider />
      <GamerGlendaRow />
      <Divider />
      <StartupShamuRow />
      <Divider />
      <VainVanessaRow />
    </>
  );
}

function OverachieverOtisRow(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={12}>
        <Typography.Title level={4}>
          <Space>
            <AimOutlined /> Overachiever Otis
          </Space>
        </Typography.Title>
        <Typography.Paragraph>
          Overachiever Otis has signed up for Google Summer of Code, a program where he works with open source project
          maintainers to develop quality software during his summer break. Before he can put the rest of his classmates
          to shame, he must first pick an organization to work with.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Overachiever Otis first applies to an organization which creates databases. He sees the mentor’s email address
          listed, and shoots him an email. The mentor replies that he must contact him through Gitter instead. When he
          sends the same query via Gitter, he’s told to discuss the topic on the project’s forum.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Overachiever Otis then applied to a GNU project. Though the mentor communicates with him via email, he must
          use their issue tracker to discuss actual project ideas, and their IRC channel for help on specific topics.
          GNU only allows the usage of free software, so when the mentor wants to jump on a call, he’s told to use
          Mumble.
        </Typography.Paragraph>
        <Typography.Paragraph>
          This ordeal leaves Overachiever Otis frustrated. He wishes he didn’t have to set up so many apps just to send
          a few messages.
        </Typography.Paragraph>
      </Col>
      <Col span={9}>
        <Image preview={false} src={winnersImage} alt='Winners' />
      </Col>
    </Row>
  );
}

function GamerGlendaRow(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={7} push={1}>
        <Image preview={false} src={videoGameNightImage} alt='Video game night' />
      </Col>
      <Col span={12}>
        <Typography.Title level={4}>
          <Space>
            <ControlOutlined /> Gamer Glenda
          </Space>
        </Typography.Title>
        <Typography.Paragraph>
          Gamer Glenda uses Discord while gaming for group audio calls on public game servers. She uses WhatsApp while
          she’s on the go to catch up on family and college chats. When she’s at home, she usually uses Facebook
          Messenger on her laptop. She uses Slack to message her coworkers at the startup she’s interning at. She uses
          Instagram to stay in touch with her friends from the UK where she used to live as a kid, and Snapchat for her
          old classmates.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Gamer Glenda’s friends and family are on a combination of these apps, and they contact her on different apps
          at different times. Her friends text her on both WhatsApp and Discord depending on which app they happen to be
          using at the time. Since it’s impractical to be boring professional the entire day, occasionally her coworkers
          will goof off on Slack during work hours, and send work related messages on WhatsApp after-hours. All of this
          causes the same conversations to be scattered around sans context
        </Typography.Paragraph>
        <Typography.Paragraph>
          Gamer Glenda wishes she didn’t have to use so many apps so that her and others’ communications would be
          well-received.
        </Typography.Paragraph>
      </Col>
    </Row>
  );
}

function StartupShamuRow(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={12}>
        <Typography.Title level={4}>
          <Space>
            <PhoneOutlined /> Startup Shamu
          </Space>
        </Typography.Title>
        <Typography.Paragraph>
          Startup Shamu is the CEO of his latest startup, and has decided to use Skype for internal communications since
          it has text, audio, and video chat. It also keeps the video chat’s messages in the chat’s history so they
          don’t get lost after a meeting.
        </Typography.Paragraph>
        <Typography.Paragraph>
          As Startup Shamu’s company grows, they switch to Slack since it’s easier to use, they prefer the way Slack
          handles sensitive data, and it comes with many integrations for tasks such as notifying software developers
          when their application has crashed.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Though Slack works well for many things, it’s call system isn’t up to the mark. For basic audio calls,
          employees use the built-in Slack calls feature but sometimes have to switch to Google Meet when they need to
          share their screen. Since Google Meet only has video chat, messages sent in it are lost afterwards.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Startup Shamu has many problems related to internal communications. He has to pay Zoom’s fees, worry about
          third party companies leaking their sensitive data, and his employees are less productive since they have to
          switch between multiple communication channels throughout the day to discuss the same topic. He wishes there
          was a communications app he could self-host so he wouldn’t need to worry about these issues while still being
          able to integrate with third party APIs.
        </Typography.Paragraph>
      </Col>
      <Col span={8}>
        <Image preview={false} src={upgradeImage} alt='Upgrade' />
      </Col>
    </Row>
  );
}

function VainVanessaRow(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={5}>
        <Image preview={false} src={makeupArtistImage} alt='Makeup artist' />
      </Col>
      <Col span={12}>
        <Typography.Title level={4}>
          <Space>
            <ShoppingCartOutlined /> Vain Vanessa
          </Space>
        </Typography.Title>
        <Typography.Paragraph>
          Vain Vanessa is a single mom who owns a small business which sells organic and natural beauty products. She
          wants to have a chat embedded on her store’s website to help customers so that she can improve sales. She
          doesn’t want to hire a software developer to create a brand new chat app, and she doesn’t want to use one of
          the existing web chat app integrations because that’ll require her to set up, and use another communications
          channel.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Her requirements are that a chatbot would initially greet the customer, and answer FAQs. If the bot is unsure
          how to proceed, or the customer explicitly requests a human’s assistance, Vain Vanessa would be notified. She
          wishes there was a way to integrate the app she already uses daily onto her website which would satisfy these
          requirements.
        </Typography.Paragraph>
      </Col>
    </Row>
  );
}
