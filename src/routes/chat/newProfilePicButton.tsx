import React, {ReactElement, useState} from 'react';
import {ShowUploadListInterface} from 'antd/lib/upload/interface';
import {UploadRequestOption as RcCustomRequestOptions} from 'rc-upload/lib/interface';
import {Button, message, Upload} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import * as restApi from '../../api/restApi';
import * as storage from '../../storage';
import {displayConnectionError, displayInvalidPicError, INVALID_PIC_ERROR, UNAUTHORIZED_ERROR} from '../../api/errors';
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
