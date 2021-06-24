import { message, notification, Typography } from 'antd';
import React from 'react';
import {
  ConnectionError,
  GraphQlResponse,
  GraphQlResponseValue,
  HttpApiConfig,
  HttpProtocol,
  InternalServerError,
  UnauthorizedError,
  WebSocketProtocol,
  WsApiConfig,
} from '@neelkamath/omni-chat';
import logOut from './logOut';

export const httpApiConfig: HttpApiConfig = {
  apiUrl: process.env.API_URL!,
  protocol: process.env.HTTP as HttpProtocol,
};

export const wsApiConfig: WsApiConfig = { apiUrl: process.env.API_URL!, protocol: process.env.WS as WebSocketProtocol };

/**
 * If `true`, the user will be logged out if the operation failed because of an invalid access/refresh token.
 *
 * An example use case of setting this to `false` is when refreshing the token set. The following example demonstrates
 * what would happen in such as case had this been set to `true`:
 * 1. The token set is attempted to be refreshed using `Query.refreshTokenSet`.
 * 1. The refresh token turns out to be invalid which causes the operation to fail with an unauthorized error.
 * 1. The user is attempted to be logged out.
 * 1. The log out operation fails with an unauthorized error because the access token is invalid.
 * 1. Since the log out operation failed with an unauthorized error, an infinite loop of attempted log outs gets
 * created.
 */
export type LogOutOnUnauthorizedError = boolean;

export async function operateGraphQlApi<T>(
  operation: () => Promise<GraphQlResponse<T>>,
  logOutOnUnauthorizedError: LogOutOnUnauthorizedError = true,
): Promise<T | undefined> {
  const response = await operateHttpApi(operation, logOutOnUnauthorizedError);
  if (response === undefined) return undefined;
  if (response.errors !== undefined) await displayBugReporter(response.errors);
  return response.data;
}

export async function operateRestApi<T>(
  operation: () => Promise<T>,
  logOutOnUnauthorizedError: LogOutOnUnauthorizedError = true,
): Promise<T | undefined> {
  return await operateHttpApi(operation, logOutOnUnauthorizedError);
}

async function operateHttpApi<T>(
  operation: () => Promise<T>,
  logOutOnUnauthorizedError: LogOutOnUnauthorizedError = true,
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    console.error(error);
    if (error instanceof UnauthorizedError) {
      if (logOutOnUnauthorizedError) await logOut();
    } else if (error instanceof ConnectionError) message.error('The server is currently unreachable.');
    else if (error instanceof InternalServerError) await displayBugReporter(error);
    else throw error;
    return undefined;
  }
}

// TODO: Automatically send back the error report instead, and show a ConnectionError instead.
export async function displayBugReporter(error: Error | GraphQlResponseValue[]): Promise<void> {
  console.error(error);
  notification.error({
    message: 'Something Went Wrong',
    description: (
      <Typography.Text>
        Please report this bug to <Typography.Link>{process.env.SUPPORT_EMAIL_ADDRESS}</Typography.Link>.
      </Typography.Text>
    ),
  });
}
