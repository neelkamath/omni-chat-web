import React, { ReactElement, useState } from 'react';
import { message, Space, Spin, Switch, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { RootState, useThunkDispatch } from '../../../store/store';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { Storage } from '../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../api';

export interface BroadcastSectionProps {
  readonly chatId: number;
}

export default function BroadcastSection({ chatId }: BroadcastSectionProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const [isLoading, setLoading] = useState(false);
  const isAdmin = useSelector((state: RootState) => ChatsSlice.selectIsAdmin(state, chatId, Storage.readUserId()!));
  const isBroadcast = useSelector((state: RootState) => ChatsSlice.selectIsBroadcast(state, chatId));
  if (isBroadcast === undefined) return <Spin size='small' />;
  const onChange = async (isChecked: boolean) => {
    setLoading(true);
    await operateSetBroadcast(chatId, isChecked);
    setLoading(false);
  };
  return (
    <Space>
      <Typography.Text>Only admins can send messages:</Typography.Text>
      <Switch checked={isBroadcast} disabled={!isAdmin} loading={isLoading} onChange={onChange} />
    </Space>
  );
}

async function operateSetBroadcast(chatId: number, isBroadcast: boolean): Promise<void> {
  const response = await setBroadcast(chatId, isBroadcast);
  if (response?.setBroadcast === null) message.success('Broadcast status updated.', 3);
  else if (response?.setBroadcast.__typename === 'MustBeAdmin')
    message.error('You must be an admin to set the broadcast status.', 5);
}

interface SetBroadcastResult {
  readonly setBroadcast: MustBeAdmin | null;
}

interface MustBeAdmin {
  readonly __typename: 'MustBeAdmin';
}

async function setBroadcast(chatId: number, isBroadcast: boolean): Promise<SetBroadcastResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation SetBroadcast($chatId: Int!, $isBroadcast: Boolean!) {
              setBroadcast(chatId: $chatId, isBroadcast: $isBroadcast) {
                __typename
              }
            }
          `,
          variables: { chatId, isBroadcast },
        },
        Storage.readAccessToken()!,
      ),
  );
}
