import React, {ReactElement} from 'react';
import {Col, Image, Row, Typography} from 'antd';
import chatBotImage from '../images/chat-bot.svg';
import openSourceImage from '../images/open-source.svg';

export default function DevelopersSection(): ReactElement {
    return (
        <Row gutter={16}>
            <BotSection/>
            <OpenSourceSection/>
        </Row>
    );
}

function BotSection(): ReactElement {
    return (
        <Row gutter={16} justify='space-around' align='middle'>
            <Col span={12}>
                <Typography.Title level={2}>Build a Bot Or UI Integration</Typography.Title>
                Read v{process.env.API_VERSION} of the {' '}
                <Typography.Link
                    target='_blank'
                    href={`https://github.com/neelkamath/omni-chat/tree/v${process.env.API_VERSION}`}
                >
                    API docs
                </Typography.Link>
                {' '} to see how to build a bot or UI integration (e.g., mobile app). The API base URL is {' '}
                <Typography.Text code>{process.env.API_URL}</Typography.Text>.
            </Col>
            <Col span={7}>
                <Image preview={false} alt='Chat bot' src={chatBotImage}/>
            </Col>
        </Row>
    );
}

function OpenSourceSection(): ReactElement {
    return (
        <Row gutter={16} justify='space-around' align='middle'>
            <Col span={7}>
                <Image preview={false} alt='Open-source' src={openSourceImage}/>
            </Col>
            <Col span={12}>
                <Typography.Title level={2}>Open-Source</Typography.Title>
                The {' '}
                <Typography.Link target='_blank' href='https://github.com/neelkamath/omni-chat-web'>
                    frontend
                </Typography.Link>
                {' '} and {' '}
                <Typography.Link target='_blank' href='https://github.com/neelkamath/omni-chat'>
                    backend
                </Typography.Link>
                {' '} are open source on GitHub. You can inspect the code, build on top of the existing app, or use the
                standalone backend to build your own frontend.
            </Col>
        </Row>
    );
}
