import React, {ReactElement} from 'react';
import {DeleteOutlined} from '@ant-design/icons';
import {Button, message} from 'antd';
import * as mutations from '../../api/graphQlApi/mutations';
import * as storage from '../../storage';
import {displayConnectionError, UNAUTHORIZED_ERROR} from '../../api/errors';
import {logOut} from '../../logOut';

export default function DeleteProfilePicButton(): ReactElement {
    return <Button icon={<DeleteOutlined/>} onClick={deleteProfilePic}>Delete Profile Pic</Button>;
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
