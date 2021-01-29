import React, {ReactElement, useEffect, useState} from 'react';
import {DeleteOutlined, LoadingOutlined, UploadOutlined} from '@ant-design/icons';
import * as subscriptionsApi from '../api/wrappers/subscriptionsApi';
import * as restApi from '../api/wrappers/restApi';
import * as storage from '../storage';
import {NonexistentUserIdError} from '../api/networking/errors';
import {logOut} from '../logOut';
import {Button, Divider, Form, Input, Space, Spin, Typography, Upload} from 'antd';
import * as mutationsApi from '../api/wrappers/mutationsApi';
import {ShowUploadListInterface} from 'antd/lib/upload/interface';
import {UploadRequestOption as RcCustomRequestOptions} from 'rc-upload/lib/interface';
import * as queriesApi from '../api/wrappers/queriesApi';
import OriginalProfilePic from './OriginalProfilePic';

export default function AccountEditor(): ReactElement {
    return (
        <>
            <Space direction='vertical'>
                <ProfilePic userId={storage.readUserId()!}/>
                <NewProfilePicButton/>
                <DeleteProfilePicButton/>
            </Space>
            <Divider/>
            <UpdateAccountSection/>
            <Divider/>
            <UpdatePasswordForm/>
        </>
    );
}

interface ProfilePicProps {
    readonly userId: number;
}

function ProfilePic({userId}: ProfilePicProps): ReactElement {
    const [profilePic, setProfilePic] = useState(<LoadingOutlined/>);
    useEffect(() => {
        const preparePic = () => {
            getProfilePic().then((pic) => {
                if (pic !== null) setProfilePic(pic);
            });
        };
        preparePic();
        return subscriptionsApi.subscribeToAccounts((message) => {
            if (message.__typename === 'UpdatedAccount' && message.userId === userId) preparePic();
        });
    }, [userId]);
    return profilePic;
}

async function getProfilePic(): Promise<ReactElement | null> {
    let pic = null;
    try {
        pic = await restApi.getProfilePic(storage.readUserId()!, 'ORIGINAL');
    } catch (error) {
        if (error instanceof NonexistentUserIdError) logOut(); // The user deleted their account.
        else throw error;
    }
    if (pic === null) return <Typography.Text>No profile picture set.</Typography.Text>;
    return <OriginalProfilePic pic={pic}/>;
}

function DeleteProfilePicButton(): ReactElement {
    const onClick = () => mutationsApi.deleteProfilePic();
    return <Button icon={<DeleteOutlined/>} onClick={onClick}>Delete Profile Picture</Button>;
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

function UpdateAccountForm(): ReactElement {
    const [form, setForm] = useState(<Spin/>);
    const [loading, setLoading] = useState(false);
    const onFinish = async (data: any) => {
        setLoading(true);
        await mutationsApi.updateAccount(data);
        setLoading(false);
    };
    useEffect(() => {
        queriesApi.readAccount().then((account) => {
            if (account === null) return;
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
                        <Button type='primary' htmlType='submit' loading={loading}>Submit</Button>
                    </Form.Item>
                </Form>
            );
        });
    }, [loading]);
    return form;
}

function UpdatePasswordForm(): ReactElement {
    const [loading, setLoading] = useState(false);
    const onFinish = async (data: any) => {
        setLoading(true);
        await mutationsApi.updateAccount(data);
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='updatePassword' layout='vertical'>
            <Form.Item name='password' label='New password' rules={[{required: true, message: 'Enter a password.'}]}>
                <Input.Password/>
            </Form.Item>
            <Form.Item>
                <Button type='primary' htmlType='submit' loading={loading}>Submit</Button>
            </Form.Item>
        </Form>
    );
}
