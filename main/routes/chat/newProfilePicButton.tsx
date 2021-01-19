import React, {ReactElement, useState} from 'react';
import {ShowUploadListInterface} from 'antd/lib/upload/interface';
import {UploadRequestOption as RcCustomRequestOptions} from 'rc-upload/lib/interface';
import {Button, message, Upload} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import {RestApi} from '../../api/restApi';
import {Storage} from '../../storage';
import {ConnectionError, InternalServerError, InvalidPicError, UnauthorizedError} from '../../api/errors';
import {logOut} from '../../logOut';

export default function NewProfilePicButton(): ReactElement {
    const [showUploadList, setShowUploadList] = useState<ShowUploadListInterface | boolean>({showRemoveIcon: false});
    const customRequest = async (data: RcCustomRequestOptions) => {
        await patchProfilePic(data);
        setShowUploadList(false);
    };
    return (
        <Upload showUploadList={showUploadList} customRequest={customRequest} accept='image/png,image/jpeg'>
            <Button icon={<UploadOutlined/>}>New Profile Picture</Button>
        </Upload>
    );
}

async function patchProfilePic(data: RcCustomRequestOptions): Promise<void> {
    try {
        await RestApi.patchProfilePic(Storage.readTokenSet()!.accessToken!, data.file);
    } catch (error) {
        if (error instanceof InvalidPicError) await InvalidPicError.display();
        else if (error instanceof UnauthorizedError) logOut();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    message.success('Profile picture updated.');
}
