import {Storage} from '../Storage';
import {message} from 'antd';
import {handleRestApiError} from './errorHandlers';
import {
  Audio,
  ContextMessageId,
  Doc,
  HttpProtocol,
  InvalidContextMessageError,
  MessageText,
  NonexistentChatError,
  NonexistentUserIdError,
  Pic,
  PicType,
  RestApi,
  UserNotInChatError,
  Video,
} from '@neelkamath/omni-chat';

export namespace RestApiWrapper {
  const restApi = new RestApi(process.env.HTTP as HttpProtocol, process.env.API_URL!);

  export async function getProfilePic(userId: number, picType: PicType): Promise<Pic | null | undefined> {
    try {
      return await restApi.getProfilePic(userId, picType);
    } catch (error) {
      if (error instanceof NonexistentUserIdError) throw error;
      await handleRestApiError(error);
      return undefined;
    }
  }

  export async function patchProfilePic(pic: File): Promise<void> {
    try {
      await restApi.patchProfilePic(Storage.readTokenSet()!.accessToken, pic);
    } catch (error) {
      await handleRestApiError(error);
      return;
    }
    message.success('Profile picture updated.');
  }

  export async function getGroupChatPic(chatId: number, picType: PicType): Promise<Pic | null | undefined> {
    try {
      return await restApi.getGroupChatPic(Storage.readTokenSet()!.accessToken, chatId, picType);
    } catch (error) {
      if (error instanceof NonexistentChatError) throw error;
      await handleRestApiError(error);
      return undefined;
    }
  }

  export async function patchGroupChatPic(chatId: number, pic: File): Promise<void> {
    try {
      await restApi.patchGroupChatPic(Storage.readTokenSet()!.accessToken!, chatId, pic);
    } catch (error) {
      await handleRestApiError(error);
      return;
    }
    message.success('Group chat picture updated.');
  }

  export async function getPicMessage(messageId: number, picType: PicType): Promise<Pic | undefined> {
    try {
      return await restApi.getPicMessage(Storage.readTokenSet()!.accessToken, messageId, picType);
    } catch (error) {
      await handleRestApiError(error);
      return undefined;
    }
  }

  export async function postPicMessage(
    pic: File,
    chatId: number,
    contextMessageId: ContextMessageId,
    caption: MessageText
  ): Promise<void> {
    try {
      await restApi.postPicMessage(Storage.readTokenSet()!.accessToken, pic, chatId, contextMessageId, caption);
    } catch (error) {
      if (error instanceof UserNotInChatError || error instanceof InvalidContextMessageError) throw error;
      await handleRestApiError(error);
    }
  }

  export async function getAudioMessage(messageId: number): Promise<Audio | undefined> {
    try {
      return await restApi.getAudioMessage(Storage.readTokenSet()!.accessToken, messageId);
    } catch (error) {
      await handleRestApiError(error);
      return undefined;
    }
  }

  export async function postAudioMessage(
    audio: File,
    chatId: number,
    contextMessageId?: ContextMessageId
  ): Promise<void> {
    try {
      await restApi.postAudioMessage(Storage.readTokenSet()!.accessToken, audio, chatId, contextMessageId);
    } catch (error) {
      if (error instanceof UserNotInChatError || error instanceof InvalidContextMessageError) throw error;
      await handleRestApiError(error);
    }
  }

  export async function getVideoMessage(messageId: number): Promise<Video | undefined> {
    try {
      return await restApi.getVideoMessage(Storage.readTokenSet()!.accessToken, messageId);
    } catch (error) {
      await handleRestApiError(error);
      return undefined;
    }
  }

  export async function postVideoMessage(
    video: File,
    chatId: number,
    contextMessageId?: ContextMessageId
  ): Promise<void> {
    try {
      await restApi.postVideoMessage(Storage.readTokenSet()!.accessToken, video, chatId, contextMessageId);
    } catch (error) {
      if (error instanceof UserNotInChatError || error instanceof InvalidContextMessageError) throw error;
      await handleRestApiError(error);
    }
  }

  export async function getDocMessage(messageId: number): Promise<Doc | undefined> {
    try {
      return await restApi.getDocMessage(Storage.readTokenSet()!.accessToken, messageId);
    } catch (error) {
      await handleRestApiError(error);
      return undefined;
    }
  }

  export async function postDocMessage(doc: File, chatId: number, contextMessageId?: ContextMessageId): Promise<void> {
    try {
      await restApi.postDocMessage(Storage.readTokenSet()!.accessToken, doc, chatId, contextMessageId);
    } catch (error) {
      if (error instanceof UserNotInChatError || error instanceof InvalidContextMessageError) throw error;
      await handleRestApiError(error);
    }
  }
}
