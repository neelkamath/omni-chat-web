import React, {ReactElement, useEffect, useState} from 'react';
import {LoadingOutlined} from '@ant-design/icons';
import * as subscriptions from '../../api/graphQlApi/subscriptions';
import * as storage from '../../storage';
import {displayConnectionError, NONEXISTENT_USER_ID_ERROR} from '../../api/errors';
import * as restApi from '../../api/restApi';
import {logOut} from '../../logOut';
import {Image, Typography} from 'antd';

export default function ProfilePic(): ReactElement {
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
