import React, {ReactElement, useEffect, useState} from 'react';
import {Button, Divider, Form, Image, Input, Menu, message, Modal, Space, Spin, Typography, Upload} from 'antd';
import {
    CustomerServiceOutlined,
    DeleteOutlined,
    LoadingOutlined,
    LogoutOutlined,
    UploadOutlined,
    UserOutlined
} from '@ant-design/icons';
import * as mutations from '../api/graphQlApi/mutations';
import * as storage from '../storage';
import {
    displayConnectionError,
    displayEmailAddressTakenError,
    displayInvalidPicError,
    displayUsernameTakenError,
    EMAIL_ADDRESS_TAKEN_ERROR,
    INVALID_PIC_ERROR,
    NONEXISTENT_USER_ID_ERROR,
    UNAUTHORIZED_ERROR,
    USERNAME_TAKEN_ERROR
} from '../api/errors';
import * as subscriptions from '../api/graphQlApi/subscriptions';
import * as restApi from '../api/restApi';
import {ShowUploadListInterface} from 'antd/lib/upload/interface';
import {UploadRequestOption as RcCustomRequestOptions} from 'rc-upload/lib/interface';
import {Account} from '../api/graphQlApi/models';
import * as queries from '../api/graphQlApi/queries';
import ContactSection from './contactSection';
import {logOut} from '../logOut';
// @ts-ignore: Cannot find module '../../static/illustrations/contact_us.svg' or its corresponding type declarations.
import contactUsImage from '../../static/illustrations/contact_us.svg';

export default function ChatPageSiderMenu(): ReactElement {
    return (
        <Menu theme='dark'>
            <AccountMenuItem/>
            <ContactMenuItem/>
            <Menu.Item>
                <Button icon={<LogoutOutlined/>} onClick={logOut}>Log Out</Button>
            </Menu.Item>
        </Menu>
    );
}

function AccountMenuItem(props: object): ReactElement {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const onCancel = () => setIsModalVisible(false);
    return (
        <Menu.Item {...props}>
            <Button icon={<UserOutlined/>} onClick={() => setIsModalVisible(true)}>Account</Button>
            <Modal title='Update Account' visible={isModalVisible} footer={null} onCancel={onCancel}>
                <Space direction='vertical'>
                    <ProfilePic/>
                    <NewProfilePicButton/>
                    <Button icon={<DeleteOutlined/>} onClick={deleteProfilePic}>Delete Profile Pic</Button>
                </Space>
                <Divider/>
                <Typography.Paragraph>
                    If you update your email address, you'll be logged out since you'll have to verify your new email
                    address.
                </Typography.Paragraph>
                <UpdateAccountForm/>
            </Modal>
        </Menu.Item>
    );
}

async function deleteProfilePic(): Promise<void> {
    try {
        await mutations.deleteProfilePic(storage.readTokenSet()!.accessToken);
    } catch (error) {
        error === UNAUTHORIZED_ERROR ? logOut() : await displayConnectionError();
        return;
    }
    message.success('Profile picture deleted.');
}

function ProfilePic(): ReactElement {
    const [profilePic, setProfilePic] = useState(<LoadingOutlined/>);
    useEffect(() => {
        const preparePic = () => {
            getProfilePic().then((pic) => {
                if (pic !== null) setProfilePic(pic);
            });
        };
        preparePic();
        return subscriptions.subscribeToAccounts(
            storage.readTokenSet()!.accessToken!,
            () => displayConnectionError,
            (message) => {
                if (message.__typename === 'UpdatedAccount') preparePic();
            },
        );
    }, []);
    return profilePic;
}

async function getProfilePic(): Promise<ReactElement | null> {
    let pic = null;
    try {
        pic = await restApi.getProfilePic(storage.readUserId()!);
    } catch (error) {
        error === NONEXISTENT_USER_ID_ERROR ? logOut() : await displayConnectionError();
        return null;
    }
    if (pic === null) return <Typography.Text>No profile picture set.</Typography.Text>;
    return <Image alt='Profile picture' preview={false} src={URL.createObjectURL(pic)}/>;
}

function NewProfilePicButton(): ReactElement {
    const [showUploadList, setShowUploadList] = useState<ShowUploadListInterface | boolean>({showRemoveIcon: false});
    const customRequest = async (data: RcCustomRequestOptions) => {
        await patchProfilePic(data);
        setShowUploadList(false);
    }
    return (
        <Upload showUploadList={showUploadList} customRequest={customRequest} accept='image/png,image/jpeg'>
            <Button icon={<UploadOutlined/>}>New Profile Picture</Button>
        </Upload>
    );
}

async function patchProfilePic(data: RcCustomRequestOptions): Promise<void> {
    try {
        await restApi.patchProfilePic(storage.readTokenSet()!.accessToken!, data.file);
    } catch (error) {
        switch (error) {
            case INVALID_PIC_ERROR:
                await displayInvalidPicError();
                break;
            case UNAUTHORIZED_ERROR:
                logOut();
                break;
            default:
                await displayConnectionError();
        }
        return;
    }
    message.success('Profile picture updated.');
}

interface AccountUpdateData {
    readonly username: string;
    /** An empty string indicates the password mustn't be updated. */
    readonly password: string;
    readonly 'email-address': string;
    readonly 'first-name': string;
    readonly 'last-name': string;
    readonly bio: string;
}

function UpdateAccountForm(): ReactElement {
    const [form, setForm] = useState(<Spin/>);
    const [loading, setLoading] = useState(false);
    const onFinish = async (formData: AccountUpdateData) => {
        setLoading(true);
        await updateAccount(formData);
        setLoading(false);
    };
    useEffect(() => {
        readAccount().then((account) => {
            if (account === null) return;
            setForm(
                <Form onFinish={onFinish} name='update-account' layout='vertical'>
                    <Form.Item
                        name='username'
                        label='Username'
                        initialValue={account.username}
                        rules={[{required: true, message: 'Enter a username.'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item name='password' label='Password' initialValue=''>
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item
                        name='email-address'
                        label='Email address'
                        initialValue={account.emailAddress}
                        rules={[{required: true, message: 'Enter an email address.'}]}
                    >
                        <Input type='email'/>
                    </Form.Item>
                    <Form.Item name='first-name' label='First name' initialValue={account.firstName}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name='last-name' label='Last name' initialValue={account.lastName}>
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

async function readAccount(): Promise<Account | null> {
    let account;
    try {
        account = await queries.readAccount(storage.readTokenSet()!.accessToken);
    } catch (error) {
        error === UNAUTHORIZED_ERROR ? logOut() : await displayConnectionError();
        return null;
    }
    return account;
}

async function updateAccount(data: AccountUpdateData): Promise<void> {
    let oldAccount;
    try {
        oldAccount = await queries.readAccount(storage.readTokenSet()!.accessToken);
        await mutations.updateAccount(storage.readTokenSet()!.accessToken, {
            username: data.username,
            password: data.password.length === 0 ? undefined : data.password,
            emailAddress: data['email-address'],
            firstName: data['first-name'],
            lastName: data['last-name'],
            bio: data.bio,
        });
    } catch (error) {
        switch (error) {
            case UNAUTHORIZED_ERROR:
                logOut();
                break;
            case USERNAME_TAKEN_ERROR:
                await displayUsernameTakenError();
                break;
            case EMAIL_ADDRESS_TAKEN_ERROR:
                await displayEmailAddressTakenError();
                break;
            default:
                await displayConnectionError();
        }
        return;
    }
    message.success('Account updated.');
    if (oldAccount.emailAddress !== data['email-address']) logOut();
}

function ContactMenuItem(props: object): ReactElement {
    const [isModalVisible, setIsModalVisible] = useState(false);
    return (
        <Menu.Item {...props}>
            <Button icon={<CustomerServiceOutlined/>} onClick={() => setIsModalVisible(true)}>Contact</Button>
            <Modal title='Contact' visible={isModalVisible} footer={null} onCancel={() => setIsModalVisible(false)}>
                <Space direction='vertical'>
                    <Image preview={false} alt='Contact us' src={contactUsImage}/>
                    <ContactSection/>
                </Space>
            </Modal>
        </Menu.Item>
    );
}
