import {Button, Empty, Image, Layout, Menu, message, Modal, Space, Typography, Upload} from 'antd';
import React, {ReactElement, useEffect, useState} from 'react';
import {
    CustomerServiceOutlined,
    DeleteOutlined,
    LoadingOutlined,
    LogoutOutlined,
    UploadOutlined,
    UserOutlined
} from '@ant-design/icons';
import {getProfilePic, patchProfilePic} from '../api/rest';
import {deleteTokenSet, readTokenSet, readUserId, saveTokenSet} from '../storage';
import ContactSection from './contactSection';
import {RcCustomRequestOptions, ShowUploadListInterface} from 'antd/lib/upload/interface';
import {
    displayConnectionError,
    displayInvalidPicError,
    INVALID_PIC_ERROR,
    NONEXISTENT_USER_ID_ERROR,
    UNAUTHORIZED_ERROR
} from '../api/errors';
import {deleteProfilePic} from '../api/graphQl/mutations';
import {subscribeToAccounts} from '../api/graphQl/subscriptions';
import {refreshTokenSet} from '../api/graphQl/queries';

export default function ChatPage(): ReactElement {
    refreshAccessToken().catch(displayConnectionError);
    return (
        <Layout>
            <Layout.Sider>
                <Menu theme='dark'>
                    <AccountMenuItem/>
                    <Menu.Item>
                        <Button icon={<LogoutOutlined/>} onClick={logOut}>Log Out</Button>
                    </Menu.Item>
                    <ContactMenuItem/>
                </Menu>
            </Layout.Sider>
            <Layout.Content style={{padding: 16}}>
                <Empty/>
            </Layout.Content>
        </Layout>
    );
}

async function refreshAccessToken(): Promise<void> {
    const refreshToken = readTokenSet()?.refreshToken;
    if (refreshToken === undefined) {
        logOut();
        return;
    }
    let tokenSet;
    try {
        tokenSet = await refreshTokenSet(refreshToken!);
    } catch (error) {
        error === UNAUTHORIZED_ERROR ? logOut() : await displayConnectionError();
        return;
    }
    saveTokenSet(tokenSet);
    const fiftyMinutes = 50 * 60 * 1000;
    setTimeout(refreshAccessToken, fiftyMinutes);
}

function AccountMenuItem(props: object): ReactElement {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showUploadList, setShowUploadList] = useState<ShowUploadListInterface | boolean>({showRemoveIcon: false});
    const [profilePic, setProfilePic] = useState(<LoadingOutlined/>);
    useEffect(() => {
        readProfilePic().then(setProfilePic);
        return subscribeToAccounts(readTokenSet()!.accessToken!, () => displayConnectionError, (message) => {
            if (message.__typename === 'UpdatedAccount') readProfilePic().then(setProfilePic);
        });
    }, []);
    const onCancel = () => setIsModalVisible(false);
    const customRequest = async (data: RcCustomRequestOptions) => {
        await uploadNewPicture(data);
        setShowUploadList(false);
    }
    return (
        <Menu.Item {...props}>
            <Button icon={<UserOutlined/>} onClick={() => setIsModalVisible(true)}>Account</Button>
            <Modal title='Update Account' visible={isModalVisible} footer={null} onCancel={onCancel}>
                <Space direction='vertical'>
                    {profilePic}
                    <Upload showUploadList={showUploadList} customRequest={customRequest} accept='image/png,image/jpeg'>
                        <Button icon={<UploadOutlined/>}>New Profile Picture</Button>
                    </Upload>
                    <Button icon={<DeleteOutlined/>} onClick={removeProfilePic}>Delete Profile Pic</Button>
                </Space>
            </Modal>
        </Menu.Item>
    );
}

async function readProfilePic(): Promise<ReactElement> {
    let pic;
    try {
        pic = await getProfilePic(readUserId()!);
    } catch (error) {
        error === NONEXISTENT_USER_ID_ERROR ? logOut() : await displayConnectionError();
    }
    if (pic === null) return <Typography.Text>No profile picture set.</Typography.Text>;
    return <Image preview={false} src={URL.createObjectURL(pic)}/>;
}

async function uploadNewPicture(data: RcCustomRequestOptions): Promise<void> {
    try {
        await patchProfilePic(readTokenSet()!.accessToken!, data.file);
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

async function removeProfilePic(): Promise<void> {
    try {
        await deleteProfilePic(readTokenSet()!.accessToken);
    } catch (error) {
        error === UNAUTHORIZED_ERROR ? logOut() : await displayConnectionError();
        return;
    }
    message.success('Profile picture deleted.');
}

function ContactMenuItem(props: object): ReactElement {
    const [isModalVisible, setIsModalVisible] = useState(false);
    return (
        <Menu.Item {...props}>
            <Button icon={<CustomerServiceOutlined/>} onClick={() => setIsModalVisible(true)}>Contact</Button>
            <Modal title='Contact' visible={isModalVisible} footer={null} onCancel={() => setIsModalVisible(false)}>
                <ContactSection/>
            </Modal>
        </Menu.Item>
    );
}

/**
 * Deletes the token set from storage, and opens the home page.
 */
function logOut(): void {
    deleteTokenSet();
    location.href = '/';
}
