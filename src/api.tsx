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

export async function operateGraphQlApi<T>(
  operation: () => Promise<GraphQlResponse<T>>,
  onUnauthorizedError: OnUnauthorizedError = logOut,
): Promise<T | undefined> {
  const response = await operateHttpApi(operation, onUnauthorizedError);
  if (response === undefined) return undefined;
  if (response.errors !== undefined) await displayBugReporter(response.errors);
  return response.data;
}

export async function operateRestApi<T>(operation: () => Promise<T>): Promise<T | undefined> {
  return await operateHttpApi(operation);
}

export type OnUnauthorizedError = () => Promise<void>;

async function operateHttpApi<T>(
  operation: () => Promise<T>,
  onUnauthorizedError: OnUnauthorizedError = logOut,
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof UnauthorizedError) await onUnauthorizedError();
    else if (error instanceof ConnectionError) message.error('The server is currently unreachable.');
    else if (error instanceof InternalServerError) await displayBugReporter(error);
    else throw error;
    console.error(error);
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
        Please report this bug to <Typography.Link>neelkamathonline@gmail.com</Typography.Link>.
      </Typography.Text>
    ),
  });
}
