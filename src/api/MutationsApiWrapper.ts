import { Storage } from '../Storage';
import { message } from 'antd';
import logOut from '../logOut';
import { displayBugReporter, handleGraphQlApiError } from './errorHandlers';
import {
  AccountInput,
  AccountUpdate,
  ActionMessageInput,
  ContextMessageId,
  GroupChatDescription,
  GroupChatInput,
  GroupChatTitle,
  HttpProtocol,
  InvalidActionError,
  InvalidChatIdError,
  InvalidMessageIdError,
  InvalidUserIdError,
  MessageStatus,
  MessageText,
  MessageTextScalarError,
  MutationsApi,
  NonexistentOptionError,
  PollInput,
  Uuid,
  UuidScalarError,
} from '@neelkamath/omni-chat';
import { QueriesApiWrapper } from './QueriesApiWrapper';

export namespace MutationsApiWrapper {
  const mutationsApi = new MutationsApi(process.env.HTTP as HttpProtocol, process.env.API_URL!);

  export async function createAccount(account: AccountInput): Promise<void> {
    try {
      await mutationsApi.createAccount(account);
    } catch (error) {
      await handleGraphQlApiError(error);
      return;
    }
    message.success('Account created. Check your email for an account verification code.');
  }

  export async function verifyEmailAddress(emailAddress: string, verificationCode: number): Promise<void> {
    let isVerified;
    try {
      isVerified = await mutationsApi.verifyEmailAddress(emailAddress, verificationCode);
    } catch (error) {
      await handleGraphQlApiError(error);
      return;
    }
    isVerified ? message.success('Email address verified.') : message.error('Incorrect verification code.');
  }

  export async function emailEmailAddressVerification(emailAddress: string): Promise<void> {
    try {
      await mutationsApi.emailEmailAddressVerification(emailAddress);
    } catch (error) {
      await handleGraphQlApiError(error);
      return;
    }
    message.success('Resent verification code.');
  }

  export async function emailPasswordResetCode(emailAddress: string): Promise<void> {
    try {
      await mutationsApi.emailPasswordResetCode(emailAddress);
    } catch (error) {
      await handleGraphQlApiError(error);
      return;
    }
    message.success('Password reset code sent to your email.');
  }

  export async function updateAccount(update: AccountUpdate): Promise<void> {
    const oldAccount = await QueriesApiWrapper.readAccount();
    if (oldAccount === undefined) return;
    try {
      await mutationsApi.updateAccount(Storage.readTokenSet()!.accessToken, update);
    } catch (error) {
      await handleGraphQlApiError(error);
      return;
    }
    message.success('Account updated.');
    if (update.emailAddress !== undefined && oldAccount.emailAddress !== update.emailAddress) await logOut();
  }

  export async function resetPassword(
    emailAddress: string,
    passwordResetCode: number,
    newPassword: string,
  ): Promise<void> {
    let isReset;
    try {
      isReset = await mutationsApi.resetPassword(emailAddress, passwordResetCode, newPassword);
    } catch (error) {
      await handleGraphQlApiError(error);
      return;
    }
    if (isReset) message.success('Password reset.');
    else message.error('Incorrect password reset code.');
  }

  export async function deleteProfilePic(): Promise<void> {
    try {
      await mutationsApi.deleteProfilePic(Storage.readTokenSet()!.accessToken);
    } catch (error) {
      await handleGraphQlApiError(error);
      return;
    }
    message.success('Profile picture deleted.');
  }

  export async function deleteAccount(): Promise<void> {
    try {
      await mutationsApi.deleteAccount(Storage.readTokenSet()!.accessToken);
    } catch (error) {
      await handleGraphQlApiError(error);
      return;
    }
    await logOut();
  }

  export async function createContacts(userIdList: number[]): Promise<void> {
    try {
      await mutationsApi.createContacts(Storage.readTokenSet()!.accessToken, userIdList);
    } catch (error) {
      await handleGraphQlApiError(error);
      return;
    }
    message.success(`${userIdList.length === 1 ? 'Contact' : 'Contacts'} created.`);
  }

  export async function deleteContacts(userIdList: number[]): Promise<void> {
    try {
      await mutationsApi.deleteContacts(Storage.readTokenSet()!.accessToken, userIdList);
    } catch (error) {
      await handleGraphQlApiError(error);
      return;
    }
    message.success(`${userIdList.length === 1 ? 'Contact' : 'Contacts'} deleted.`);
  }

  export async function blockUser(userId: number): Promise<void> {
    try {
      await mutationsApi.blockUser(Storage.readTokenSet()!.accessToken, userId);
    } catch (error) {
      if (error instanceof InvalidUserIdError) message.error('That user just deleted their account.');
      else await handleGraphQlApiError(error);
      return;
    }
    message.success('User blocked.');
  }

  export async function unblockUser(userId: number): Promise<void> {
    try {
      await mutationsApi.unblockUser(Storage.readTokenSet()!.accessToken, userId);
    } catch (error) {
      await handleGraphQlApiError(error);
      return;
    }
    message.success('User unblocked.');
  }

  export async function setOnline(isOnline: boolean): Promise<void> {
    if (Storage.readTokenSet() === undefined) return;
    try {
      await mutationsApi.setOnline(Storage.readTokenSet()!.accessToken, isOnline);
    } catch (error) {
      await handleGraphQlApiError(error);
    }
  }

  export async function star(messageId: number): Promise<void> {
    try {
      await mutationsApi.star(Storage.readTokenSet()!.accessToken, messageId);
    } catch (error) {
      if (error instanceof InvalidMessageIdError) message.error('That message no longer exists.');
      else await handleGraphQlApiError(error);
    }
  }

  export async function deleteStar(messageId: number): Promise<void> {
    try {
      await mutationsApi.deleteStar(Storage.readTokenSet()!.accessToken, messageId);
    } catch (error) {
      await handleGraphQlApiError(error);
    }
  }

  export async function setTyping(isTyping: boolean): Promise<void> {
    try {
      await mutationsApi.setTyping(Storage.readTokenSet()!.accessToken, isTyping);
    } catch (error) {
      await handleGraphQlApiError(error);
    }
  }

  export async function deleteGroupChatPic(chatId: number): Promise<void> {
    try {
      await mutationsApi.deleteGroupChatPic(Storage.readTokenSet()!.accessToken, chatId);
    } catch (error) {
      await handleGraphQlApiError(error);
    }
  }

  export async function createStatus(messageId: number, status: MessageStatus): Promise<void> {
    try {
      await mutationsApi.createStatus(Storage.readTokenSet()!.accessToken, messageId, status);
    } catch (error) {
      if (error instanceof InvalidMessageIdError) message.error('You are no longer in this chat.');
      else await handleGraphQlApiError(error);
    }
  }

  export async function updateGroupChatTitle(chatId: number, title: GroupChatTitle): Promise<void> {
    try {
      await mutationsApi.updateGroupChatTitle(Storage.readTokenSet()!.accessToken, chatId, title);
    } catch (error) {
      await handleGraphQlApiError(error);
    }
  }

  export async function updateGroupChatDescription(chatId: number, description: GroupChatDescription): Promise<void> {
    try {
      await mutationsApi.updateGroupChatDescription(Storage.readTokenSet()!.accessToken, chatId, description);
    } catch (error) {
      await handleGraphQlApiError(error);
    }
  }

  export async function addGroupChatUsers(chatId: number, userIdList: number[]): Promise<void> {
    try {
      await mutationsApi.addGroupChatUsers(Storage.readTokenSet()!.accessToken, chatId, userIdList);
    } catch (error) {
      await handleGraphQlApiError(error);
    }
  }

  export async function removeGroupChatUsers(chatId: number, userIdList: number[]): Promise<void> {
    try {
      await mutationsApi.removeGroupChatUsers(Storage.readTokenSet()!.accessToken, chatId, userIdList);
    } catch (error) {
      if (error instanceof InvalidUserIdError)
        message.error(
          "You're the last admin, and there are participants other than yourself. You'll need to first appoint a " +
            'different user as an admin.',
          10,
        );
      else await handleGraphQlApiError(error);
    }
  }

  export async function makeGroupChatAdmins(chatId: number, userIdList: number[]): Promise<void> {
    try {
      await mutationsApi.makeGroupChatAdmins(Storage.readTokenSet()!.accessToken, chatId, userIdList);
    } catch (error) {
      await handleGraphQlApiError(error);
    }
  }

  export async function createGroupChat(chat: GroupChatInput): Promise<void> {
    try {
      await mutationsApi.createGroupChat(Storage.readTokenSet()!.accessToken, chat);
    } catch (error) {
      await handleGraphQlApiError(error);
    }
  }

  export async function setBroadcast(chatId: number, isBroadcast: boolean): Promise<void> {
    try {
      await mutationsApi.setBroadcast(Storage.readTokenSet()!.accessToken, chatId, isBroadcast);
    } catch (error) {
      await handleGraphQlApiError(error);
    }
  }

  export async function setInvitability(chatId: number, isInvitable: boolean): Promise<void> {
    try {
      await mutationsApi.setInvitability(Storage.readTokenSet()!.accessToken, chatId, isInvitable);
    } catch (error) {
      if (error instanceof InvalidChatIdError) await displayBugReporter();
      else await handleGraphQlApiError(error);
    }
  }

  export async function joinGroupChat(inviteCode: Uuid): Promise<void> {
    try {
      await mutationsApi.joinGroupChat(Storage.readTokenSet()!.accessToken, inviteCode);
    } catch (error) {
      if (error instanceof UuidScalarError) await displayBugReporter();
      else await handleGraphQlApiError(error);
    }
  }

  export async function deletePrivateChat(chatId: number): Promise<void> {
    try {
      await mutationsApi.deletePrivateChat(Storage.readTokenSet()!.accessToken, chatId);
    } catch (error) {
      await handleGraphQlApiError(error);
    }
  }

  export async function createPrivateChat(userId: number): Promise<number | undefined> {
    try {
      return await mutationsApi.createPrivateChat(Storage.readTokenSet()!.accessToken, userId);
    } catch (error) {
      if (error instanceof InvalidUserIdError) message.error('That user just deleted their account.');
      else await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function createTextMessage(
    chatId: number,
    text: MessageText,
    contextMessageId?: ContextMessageId,
  ): Promise<void> {
    try {
      await mutationsApi.createTextMessage(Storage.readTokenSet()!.accessToken, chatId, text, contextMessageId);
    } catch (error) {
      if (error instanceof InvalidMessageIdError) message.error('The message being replied to no longer exists.');
      else await handleGraphQlApiError(error);
    }
  }

  export async function createActionMessage(
    chatId: number,
    actionMessage: ActionMessageInput,
    contextMessageId?: ContextMessageId,
  ): Promise<void> {
    try {
      await mutationsApi.createActionMessage(
        Storage.readTokenSet()!.accessToken,
        chatId,
        actionMessage,
        contextMessageId,
      );
    } catch (error) {
      if (error instanceof InvalidMessageIdError) message.error('The message being replied to no longer exists.');
      else await handleGraphQlApiError(error);
    }
  }

  export async function createGroupChatInviteMessage(
    chatId: number,
    invitedChatId: number,
    contextMessageId?: ContextMessageId,
  ): Promise<void> {
    try {
      await mutationsApi.createGroupChatInviteMessage(
        Storage.readTokenSet()!.accessToken,
        chatId,
        invitedChatId,
        contextMessageId,
      );
    } catch (error) {
      if (error instanceof InvalidMessageIdError) message.error('The message being replied to no longer exists.');
      else await handleGraphQlApiError(error);
    }
  }

  export async function createPollMessage(
    chatId: number,
    poll: PollInput,
    contextMessageId?: ContextMessageId,
  ): Promise<void> {
    try {
      await mutationsApi.createPollMessage(Storage.readTokenSet()!.accessToken, chatId, poll, contextMessageId);
    } catch (error) {
      if (error instanceof InvalidMessageIdError) message.error('The message being replied to no longer exists.');
      else await handleGraphQlApiError(error);
    }
  }

  export async function forwardMessage(
    chatId: number,
    messageId: number,
    contextMessageId?: ContextMessageId,
  ): Promise<void> {
    try {
      await mutationsApi.forwardMessage(Storage.readTokenSet()!.accessToken, chatId, messageId, contextMessageId);
    } catch (error) {
      if (error instanceof InvalidMessageIdError) message.error('That message no longer exists.');
      else await handleGraphQlApiError(error);
    }
  }

  export async function triggerAction(messageId: number, action: MessageText): Promise<void> {
    try {
      await mutationsApi.triggerAction(Storage.readTokenSet()!.accessToken, messageId, action);
    } catch (error) {
      if (error instanceof InvalidMessageIdError) message.error('That actionable message no longer exists.');
      else if (error instanceof InvalidActionError || error instanceof MessageTextScalarError)
        await displayBugReporter();
      else await handleGraphQlApiError(error);
    }
  }

  export async function setPollVote(messageId: number, option: MessageText, vote: boolean): Promise<void> {
    try {
      await mutationsApi.setPollVote(Storage.readTokenSet()!.accessToken, messageId, option, vote);
    } catch (error) {
      if (error instanceof InvalidMessageIdError) message.error('That poll no longer exists.');
      else if (error instanceof NonexistentOptionError) await displayBugReporter();
      else await handleGraphQlApiError(error);
    }
  }

  export async function deleteMessage(messageId: number): Promise<void> {
    try {
      await mutationsApi.deleteMessage(Storage.readTokenSet()!.accessToken, messageId);
    } catch (error) {
      if (error instanceof InvalidMessageIdError) message.error('You are no longer in this chat.');
      else await handleGraphQlApiError(error);
    }
  }
}
