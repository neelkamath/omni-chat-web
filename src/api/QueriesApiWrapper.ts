import logOut from '../logOut';
import {displayBugReporter, handleGraphQlApiError} from './errorHandlers';
import {
  Account,
  AccountsConnection,
  BackwardPagination,
  Chat,
  ChatMessages,
  ForwardPagination,
  GroupChat,
  GroupChatInfo,
  HttpProtocol,
  Login,
  MessageEdge,
  NonexistentUserError,
  OnlineStatus,
  QueriesApi,
  StarredMessage,
  TypingStatus,
  Uuid,
  UuidScalarError,
} from '@neelkamath/omni-chat';
import {Storage} from '../Storage';
import {message} from 'antd';

export namespace QueriesApiWrapper {
  const queriesApi = new QueriesApi(
    process.env.HTTP as HttpProtocol,
    process.env.API_URL!
  );

  export async function requestTokenSet(login: Login): Promise<void> {
    let tokenSet;
    try {
      tokenSet = await queriesApi.requestTokenSet(login);
    } catch (error) {
      error instanceof NonexistentUserError
        ? message.error("That username couldn't be found.")
        : await handleGraphQlApiError(error);
      return;
    }
    Storage.saveTokenSet(tokenSet);
    location.href = '/chat';
  }

  /**
   * Ensures the token set saved to {@link localStorage} is always valid. If the
   * currently saved token set either doesn't exist or is invalid, the user will
   * be logged out.
   */
  export async function refreshTokenSet(): Promise<void> {
    const refreshToken = Storage.readTokenSet()?.refreshToken;
    if (refreshToken === undefined) {
      await logOut();
      return;
    }
    let tokenSet;
    try {
      tokenSet = await queriesApi.refreshTokenSet(refreshToken);
    } catch (error) {
      await handleGraphQlApiError(error);
      return;
    }
    Storage.saveTokenSet(tokenSet);
    const fiftyMinutes = 50 * 60 * 1000;
    setTimeout(refreshTokenSet, fiftyMinutes);
  }

  export async function readAccount(): Promise<Account | undefined> {
    try {
      return await queriesApi.readAccount(Storage.readTokenSet()!.accessToken);
    } catch (error) {
      await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function searchUsers(
    query: string,
    pagination?: ForwardPagination
  ): Promise<AccountsConnection | undefined> {
    try {
      return await queriesApi.searchUsers(query, pagination);
    } catch (error) {
      await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function searchContacts(
    query: string,
    pagination?: ForwardPagination
  ): Promise<AccountsConnection | undefined> {
    try {
      return await queriesApi.searchContacts(
        Storage.readTokenSet()!.accessToken,
        query,
        pagination
      );
    } catch (error) {
      await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function readBlockedUsers(
    pagination?: ForwardPagination
  ): Promise<AccountsConnection | undefined> {
    try {
      return await queriesApi.readBlockedUsers(
        Storage.readTokenSet()!.accessToken,
        pagination
      );
    } catch (error) {
      await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function readTypingStatuses(): Promise<TypingStatus[] | undefined> {
    try {
      return await queriesApi.readTypingStatuses(
        Storage.readTokenSet()!.accessToken
      );
    } catch (error) {
      await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function readChat(
    id: number,
    privateChatMessagesPagination?: BackwardPagination,
    groupChatUsersPagination?: ForwardPagination,
    groupChatMessagesPagination?: BackwardPagination
  ): Promise<Chat | undefined> {
    try {
      return await queriesApi.readChat(
        Storage.readTokenSet()!.accessToken,
        id,
        privateChatMessagesPagination,
        groupChatUsersPagination,
        groupChatMessagesPagination
      );
    } catch (error) {
      await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function readOnlineStatuses(): Promise<OnlineStatus[] | undefined> {
    try {
      return await queriesApi.readOnlineStatuses(
        Storage.readTokenSet()!.accessToken
      );
    } catch (error) {
      await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function readChats(
    privateChatMessagesPagination?: BackwardPagination,
    groupChatUsersPagination?: ForwardPagination,
    groupChatMessagesPagination?: BackwardPagination
  ): Promise<Chat[] | undefined> {
    try {
      return await queriesApi.readChats(
        Storage.readTokenSet()!.accessToken,
        privateChatMessagesPagination,
        groupChatUsersPagination,
        groupChatMessagesPagination
      );
    } catch (error) {
      await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function readStars(): Promise<StarredMessage[] | undefined> {
    try {
      return await queriesApi.readStars(Storage.readTokenSet()!.accessToken);
    } catch (error) {
      await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function searchChatMessages(
    chatId: number,
    query: string,
    pagination?: BackwardPagination
  ): Promise<MessageEdge[] | undefined> {
    try {
      return await queriesApi.searchChatMessages(
        Storage.readTokenSet()!.accessToken,
        chatId,
        query,
        pagination
      );
    } catch (error) {
      await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function searchMessages(
    query: string,
    privateChatMessagesPagination?: BackwardPagination,
    groupChatUsersPagination?: ForwardPagination,
    groupChatMessagesPagination?: BackwardPagination
  ): Promise<ChatMessages[] | undefined> {
    try {
      return await queriesApi.searchMessages(
        Storage.readTokenSet()!.accessToken,
        query,
        privateChatMessagesPagination,
        groupChatUsersPagination,
        groupChatMessagesPagination
      );
    } catch (error) {
      await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function readGroupChat(
    inviteCode: Uuid
  ): Promise<GroupChatInfo | undefined> {
    try {
      return await queriesApi.readGroupChat(inviteCode);
    } catch (error) {
      if (error instanceof UuidScalarError) await displayBugReporter();
      else await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function searchChats(
    query: string,
    privateChatMessagesPagination?: BackwardPagination,
    groupChatUsersPagination?: ForwardPagination,
    groupChatMessagesPagination?: BackwardPagination
  ): Promise<Chat[] | undefined> {
    try {
      return await queriesApi.searchChats(
        Storage.readTokenSet()!.accessToken,
        query,
        privateChatMessagesPagination,
        groupChatUsersPagination,
        groupChatMessagesPagination
      );
    } catch (error) {
      await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function searchPublicChats(
    query: string
  ): Promise<GroupChat[] | undefined> {
    try {
      return await queriesApi.searchPublicChats(query);
    } catch (error) {
      await handleGraphQlApiError(error);
      return undefined;
    }
  }

  export async function readContacts(
    pagination?: ForwardPagination
  ): Promise<AccountsConnection | undefined> {
    try {
      return await queriesApi.readContacts(
        Storage.readTokenSet()!.accessToken,
        pagination
      );
    } catch (error) {
      await handleGraphQlApiError(error);
      return undefined;
    }
  }
}
