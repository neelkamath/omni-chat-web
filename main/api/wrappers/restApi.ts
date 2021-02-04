import * as restApi from '../networking/restApi';
import {PicType} from '../networking/restApi';
import * as storage from '../../storage';
import {ConnectionError, InternalServerError, InvalidPicError, UnauthorizedError} from '../networking/errors';
import logOut from '../../logOut';
import {message} from 'antd';

export async function patchProfilePic(file: File): Promise<void> {
    try {
        await restApi.patchProfilePic(storage.readTokenSet()!.accessToken!, file);
    } catch (error) {
        if (error instanceof InvalidPicError) await InvalidPicError.display();
        else if (error instanceof UnauthorizedError) await logOut();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    message.success('Profile picture updated.');
}

/** @throws {NonexistentUserIdError} */
export async function getProfilePic(userId: number, picType: PicType): Promise<Blob | null> {
    let pic = null;
    try {
        pic = await restApi.getProfilePic(userId, picType);
    } catch (error) {
        if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
    }
    return pic;
}

/** @throws {NonexistentChatError} */
export async function getGroupChatPic(chatId: number, picType: PicType): Promise<Blob | null> {
    let pic = null;
    try {
        pic = await restApi.getGroupChatPic(chatId, picType);
    } catch (error) {
        if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
    }
    return pic;
}
