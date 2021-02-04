import React, {ReactElement, ReactNode, useEffect, useState} from 'react';
import {DeleteOutlined, UploadOutlined} from '@ant-design/icons';
import * as subscriptionsApi from '../../api/wrappers/subscriptionsApi';
import * as restApi from '../../api/wrappers/restApi';
import * as storage from '../../storage';
import {NonexistentUserIdError} from '../../api/networking/errors';
import logOut from '../../logOut';
import {Button, Divider, Form, Input, Row, Space, Spin, Typography, Upload} from 'antd';
import * as mutationsApi from '../../api/wrappers/mutationsApi';
import {ShowUploadListInterface} from 'antd/lib/upload/interface';
import {UploadRequestOption as RcCustomRequestOptions} from 'rc-upload/lib/interface';
import * as queriesApi from '../../api/wrappers/queriesApi';
import OriginalProfilePic from './OriginalProfilePic';

export default function AccountEditor(): ReactElement {
    return (
        <Row style={{padding: 16}}>
            <Space direction='vertical'>
                <ProfilePic userId={storage.readUserId()!}/>
                <NewProfilePicButton/>
                <DeleteProfilePicButton/>
            </Space>
            <Divider/>
            <UpdateAccountSection/>
            <Divider/>
            <UpdatePasswordForm/>
        </Row>
    );
}

interface ProfilePicProps {
    readonly userId: number;
}

function ProfilePic({userId}: ProfilePicProps): ReactElement {
    const [profilePic, setProfilePic] = useState(<Spin size='small'/>);
    useEffect(() => {
        return subscriptionsApi.subscribeToAccounts((message) => {
            const isUpdatedAccount = message.__typename === 'UpdatedAccount' && message.userId === userId;
            if (message.__typename === 'CreatedSubscription' || isUpdatedAccount) getProfilePic().then(setProfilePic);
        });
    }, [userId]);
    return profilePic;
}

async function getProfilePic(): Promise<ReactNode> {
    let pic = null;
    try {
        pic = await restApi.getProfilePic(storage.readUserId()!, 'ORIGINAL');
    } catch (error) {
        if (error instanceof NonexistentUserIdError) await logOut(); // The user deleted their account.
        else throw error;
    }
    return pic === null ? 'No profile picture set.' : <OriginalProfilePic pic={pic}/>;
}

function DeleteProfilePicButton(): ReactElement {
    const onClick = () => mutationsApi.deleteProfilePic();
    return <Button danger icon={<DeleteOutlined/>} onClick={onClick}>Delete Profile Picture</Button>;
}

function NewProfilePicButton(): ReactElement {
    const [showUploadList, setShowUploadList] = useState<ShowUploadListInterface | boolean>({showRemoveIcon: false});
    const customRequest = async (data: RcCustomRequestOptions) => {
        await restApi.patchProfilePic(data.file);
        setShowUploadList(false);
    };
    return (
        <Upload showUploadList={showUploadList} customRequest={customRequest} accept='image/png,image/jpeg'>
            <Button icon={<UploadOutlined/>}>New Profile Picture</Button>
        </Upload>
    );
}

function UpdateAccountSection(): ReactElement {
    return (
        <>
            <Typography.Paragraph>
                If you update your email address, you&apos;ll be logged out since you&apos;ll have to verify your new
                email address.
            </Typography.Paragraph>
            <UpdateAccountForm/>
        </>
    );
}

interface UpdateAccountFormData {
    readonly username: string;
    readonly emailAddress: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly bio: string;
}

function UpdateAccountForm(): ReactElement {
    const [form, setForm] = useState(<Spin/>);
    const [isLoading, setLoading] = useState(false);
    const onFinish = async (data: UpdateAccountFormData) => {
        setLoading(true);
        await mutationsApi.updateAccount({__typename: 'AccountUpdate', password: null, ...data});
        setLoading(false);
    };
    useEffect(() => {
        queriesApi.readAccount().then((account) => {
            if (account === undefined) return;
            setForm(
                <Form onFinish={onFinish} name='updateAccount' layout='vertical'>
                    <Form.Item
                        name='username'
                        label='Username'
                        initialValue={account.username}
                        rules={[{required: true, message: 'Enter a username.'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name='emailAddress'
                        label='Email address'
                        initialValue={account.emailAddress}
                        rules={[{required: true, message: 'Enter an email address.'}]}
                    >
                        <Input type='email'/>
                    </Form.Item>
                    <Form.Item name='firstName' label='First name' initialValue={account.firstName}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name='lastName' label='Last name' initialValue={account.lastName}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name='bio' label='Bio' initialValue={account.bio}>
                        <Input.TextArea/>
                    </Form.Item>
                    <Form.Item>
                        <Button type='primary' htmlType='submit' loading={isLoading}>Submit</Button>
                    </Form.Item>
                </Form>
            );
        });
    }, [isLoading]);
    return form;
}

interface UpdatePasswordFormData {
    readonly password: string;
}

function UpdatePasswordForm(): ReactElement {
    const [isLoading, setLoading] = useState(false);
    const onFinish = async ({password}: UpdatePasswordFormData) => {
        setLoading(true);
        await mutationsApi.updateAccount({
            __typename: 'AccountUpdate',
            username: null,
            password: password,
            emailAddress: null,
            firstName: null,
            lastName: null,
            bio: null,
        });
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='updatePassword' layout='vertical'>
            <Form.Item name='password' label='New password' rules={[{required: true, message: 'Enter a password.'}]}>
                <Input.Password/>
            </Form.Item>
            <Form.Item>
                <Button type='primary' htmlType='submit' loading={isLoading}>Submit</Button>
            </Form.Item>
        </Form>
    );
}
