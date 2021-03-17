import React, { ReactElement } from 'react';
import { Col, Divider, Image, List, Row, Typography } from 'antd';
import breakingBarriersImage from '../../images/breaking-barriers.svg';

export default function TheProblemRow(): ReactElement {
  return (
    <>
      <Divider>
        <Typography.Title level={3}>The Problem</Typography.Title>
      </Divider>
      <ExplanationRow />
    </>
  );
}

function ExplanationRow(): ReactElement {
  return (
    <Row gutter={16} justify='space-around' align='middle'>
      <Col span={6} push={1}>
        <Image preview={false} src={breakingBarriersImage} alt='Breaking barriers' />
      </Col>
      <Col span={12} push={1}>
        Currently, we must use a combination of WhatsApp, Slack, Telegram, etc. to communicate. This causes the
        following issues:
        <List size='small'>
          <List.Item>
            Each time a topic’s information is needed, multiple apps must be searched to piece together the information
            part by part.
          </List.Item>
          <List.Item>
            There’s a mental burden of switching between apps during the same conversation. For example, you may be
            texting your coworkers on Slack but then need to switch to a Google Meet call to screen share.
          </List.Item>
          <List.Item>
            Switching apps causes noticeable delays which takes away the main point of instant messaging.
          </List.Item>
          <List.Item>Switching between apps results in businesses losing productivity.</List.Item>
          <List.Item>
            Having to maintain multiple accounts annoys the average user because none of the apps fulfill the user’s
            needs well enough.
          </List.Item>
        </List>
      </Col>
    </Row>
  );
}
