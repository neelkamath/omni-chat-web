import React, { ReactElement } from 'react';
import { Form, message, RadioChangeEvent, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { RootState, useThunkDispatch } from '../../../../store/store';
import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import { Storage } from '../../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import PublicityRadioGroup from '../../PublicityRadioGroup';

export interface PublicitySectionProps {
  readonly chatId: number;
}

export default function PublicitySection({ chatId }: PublicitySectionProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const isAdmin = useSelector((state: RootState) => ChatsSlice.selectIsAdmin(state, chatId, Storage.readUserId()!));
  const publicity = useSelector((state: RootState) => ChatsSlice.selectPublicity(state, chatId));
  if (publicity === undefined) return <Spin size='small' />;
  const onChange = async ({ target }: RadioChangeEvent) => {
    const result = await setInvitability(chatId, target.value);
    if (result?.setInvitability === null) message.success('Publicity updated.', 3);
  };
  // FIXME: Doesn't re-render when <chatId> changes.
  return (
    <Form name='updatePublicity' layout='vertical' initialValues={{ publicity }}>
      <PublicityRadioGroup
        isInvitableDisabled={!isAdmin || publicity === 'PUBLIC'}
        isNotInvitableDisabled={!isAdmin || publicity === 'PUBLIC'}
        isPublicDisabled={true}
        onChange={onChange}
      />
    </Form>
  );
}

interface InvalidChatId {
  readonly __typename: 'InvalidChatId';
}

interface SetInvitabilityResult {
  readonly setInvitability: InvalidChatId | null;
}

async function setInvitability(chatId: number, isInvitable: boolean): Promise<SetInvitabilityResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation SetInvitability($chatId: Int!, $isInvitable: Boolean!) {
              setInvitability(chatId: $chatId, isInvitable: $isInvitable) {
                ... on InvalidChatId {
                  __typename
                }
              }
            }
          `,
          variables: { chatId, isInvitable },
        },
        Storage.readAccessToken()!,
      ),
  );
}
