import React, {ReactElement} from 'react';
import {DeleteOutlined} from '@ant-design/icons';
import {Button, message} from 'antd';
import {Mutations} from '../../api/graphQlApi/mutations';
import {Storage} from '../../storage';
import {ConnectionError, InternalServerError, UnauthorizedError} from '../../api/errors';
import {logOut} from '../../logOut';

export default function DeleteProfilePicButton(): ReactElement {
    return <Button icon={<DeleteOutlined/>} onClick={deleteProfilePic}>Delete Profile Pic</Button>;
}

async function deleteProfilePic(): Promise<void> {
    try {
        await Mutations.deleteProfilePic(Storage.readTokenSet()!.accessToken);
    } catch (error) {
        if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) logOut();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    message.success('Profile picture deleted.');
}
