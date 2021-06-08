import React, { ReactElement, useState } from 'react';
import { message, Space, Spin, Switch, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { Placeholder, queryOrMutate } from '@neelkamath/omni-chat';
import { RootState, useThunkDispatch } from '../../../../store/store';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import { Storage } from '../../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';

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
    const result = await setBroadcast(chatId, isChecked);
    if (result !== undefined) message.success('Broadcast status updated.', 3);
    setLoading(false);
  };
  return (
    <Space>
      <Typography.Text>Only admins can send messages:</Typography.Text>
      <Switch checked={isBroadcast} disabled={!isAdmin} loading={isLoading} onChange={onChange} />
    </Space>
  );
}

interface SetBroadcastResult {
  readonly setBroadcast: Placeholder;
}

async function setBroadcast(chatId: number, isBroadcast: boolean): Promise<SetBroadcastResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation SetBroadcast($chatId: Int!, $isBroadcast: Boolean!) {
              setBroadcast(chatId: $chatId, isBroadcast: $isBroadcast)
            }
          `,
          variables: { chatId, isBroadcast },
        },
        Storage.readAccessToken()!,
      ),
  );
}
