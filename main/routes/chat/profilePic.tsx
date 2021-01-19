import React, {ReactElement, useEffect, useState} from 'react';
import {LoadingOutlined} from '@ant-design/icons';
import {Subscriptions} from '../../api/graphQlApi/subscriptions';
import {Storage} from '../../storage';
import {ConnectionError, InternalServerError, NonexistentUserIdError} from '../../api/errors';
import {RestApi} from '../../api/restApi';
import {logOut} from '../../logOut';
import {Image, Typography} from 'antd';

export interface ProfilePicProps {
    readonly userId: number;
}

export default function ProfilePic({userId}: ProfilePicProps): ReactElement {
    const [profilePic, setProfilePic] = useState(<LoadingOutlined/>);
    useEffect(() => {
        const preparePic = () => {
            getProfilePic().then((pic) => {
                if (pic !== null) setProfilePic(pic);
            });
        };
        preparePic();
        return Subscriptions.subscribeToAccounts(
            Storage.readTokenSet()!.accessToken!,
            ConnectionError.display,
            (message) => {
                if (message.__typename === 'UpdatedAccount' && message.userId === userId) preparePic();
            },
        );
    }, []);
    return profilePic;
}

async function getProfilePic(): Promise<ReactElement | null> {
    let pic = null;
    try {
        pic = await RestApi.getProfilePic(Storage.readUserId()!);
    } catch (error) {
        if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof NonexistentUserIdError) logOut(); // The user deleted their account.
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return null;
    }
    if (pic === null) return <Typography.Text>No profile picture set.</Typography.Text>;
    return <Image alt='Profile picture' preview={false} src={URL.createObjectURL(pic)}/>;
}
