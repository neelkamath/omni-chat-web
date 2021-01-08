import React, {ReactElement} from 'react';
import {Card, Image, List, Space, Typography} from 'antd';
// @ts-ignore: Cannot find module '../cover.png' or its corresponding type declarations.
import cover from '../cover.png';
import HomeLayout from './homeLayout';

export default function HomePage(): ReactElement {
    return (
        <HomeLayout>
            <Space direction='vertical'>
                <Image preview={false} src={cover} alt='Cover'/>
                <Typography.Title level={2}>Features</Typography.Title>
                <UsersCard/>
                <ChatsCard/>
                <GroupChatsCard/>
                <FreeCallsCard/>
                <PowerfulMessagesCard/>
                <ExtensibleCard/>
            </Space>
        </HomeLayout>
    );
}

function UsersCard(): ReactElement {
    return (
        <Card title='Users'>
            <List>
                <List.Item>Search for your friends and family.</List.Item>
                <List.Item>Use on any device - no phone required.</List.Item>
                <List.Item>Automatic online status.</List.Item>
            </List>
        </Card>
    );
}

function ChatsCard(): ReactElement {
    return (
        <Card title='Chats'>
            <List>
                <List.Item>Private chats.</List.Item>
                <List.Item>Group chats.</List.Item>
                <List.Item>
                    Broadcast chats where only admins can message. This option can be toggled for a chat any time. This
                    is for chats for updates, like a conference's chat where you don't want hundreds of people asking
                    the same questions over and over again.
                </List.Item>
                <List.Item>
                    Public chats such as an official Android chat, random groups individuals have created, and a Mario
                    Kart chat. People can search for, and view public chats without an account. Anyone with an account
                    can join them.
                </List.Item>
            </List>
        </Card>
    );
}

function GroupChatsCard(): ReactElement {
    return (
        <Card title='Group Chats'>
            <List>
                <List.Item>Chat description and icon.</List.Item>
                <List.Item>Multiple admins.</List.Item>
                <List.Item>Newly added participants can view previously sent messages.</List.Item>
                <List.Item>Unlimited participants.</List.Item>
                <List.Item>Invite codes.</List.Item>
            </List>
        </Card>
    );
}

function FreeCallsCard(): ReactElement {
    return (
        <Card title='Free Calls'>
            <List>
                <List.Item>Group audio calls.</List.Item>
                <List.Item>Group video calls.</List.Item>
                <List.Item>Screen sharing.</List.Item>
                <List.Item>Background noise cancellation for both audio and video calls.</List.Item>
                <List.Item>Spatial audio calls for gamers.</List.Item>
            </List>
        </Card>
    );
}

function PowerfulMessagesCard(): ReactElement {
    return (
        <Card title='Powerful Messages'>
            <List>
                <List.Item>
                    Send texts, audio, pictures, videos, polls, documents, group chat invites, and actions (buttons
                    which trigger third-party server-side code such as ordering food via a bot).
                </List.Item>
                <List.Item>Forward messages.</List.Item>
                <List.Item>Search messages.</List.Item>
                <List.Item>See when the message was sent, delivered, and read.</List.Item>
                <List.Item>Delete messages.</List.Item>
                <List.Item>Star messages.</List.Item>
                <List.Item>Markdown support.</List.Item>
                <List.Item>Reply to a message to prevent context loss.</List.Item>
            </List>
        </Card>
    );
}

function ExtensibleCard(): ReactElement {
    return (
        <Card title='Extensible'>
            <List>
                <List.Item>
                    Omni Chat can be deployed for private use as well. For example, a company may only want to use it as
                    an internal platform, in which case they can specify that only certain email address domains can
                    create accounts. This way, even if an intruder gets into the company's network, they won't be able
                    to create an account since they won't have a company issued email address. This feature also
                    prevents employees from creating an account with their personal email address. Here are the
                    instructions to {' '}
                    <Typography.Link href='https://github.com/neelkamath/omni-chat' target='_blank'>
                        run your own instance
                    </Typography.Link>.
                </List.Item>
                <List.Item>
                    Create and use bots which give power to restaurant owners, customer service representatives, DevOps
                    teams, etc. Bots can have buttons so that integrations can easily execute code. For example, if a
                    Travis CI build fails, a bot could message the specifics on the group with a button, which when
                    clicked, automatically reruns the CI/CD pipeline.
                </List.Item>
                <List.Item>
                    This project is open source on {' '}
                    <Typography.Link target='_blank' href='https://github.com/neelkamath/omni-chat-web'>
                        GitHub
                    </Typography.Link>
                    .
                </List.Item>
            </List>
        </Card>
    );
}
