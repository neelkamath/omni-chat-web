import React, { ReactElement } from 'react';
import { Form, message, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { queryOrMutate } from '@neelkamath/omni-chat';
import { RootState, useThunkDispatch } from '../../../store/store';
import { ChatsSlice } from '../../../store/slices/ChatsSlice';
import { Storage } from '../../../Storage';
import { httpApiConfig, operateGraphQlApi } from '../../../api';
import PublicityRadioGroup from '../PublicityRadioGroup';

export interface PublicitySectionProps {
  readonly chatId: number;
}

export default function PublicitySection({ chatId }: PublicitySectionProps): ReactElement {
  useThunkDispatch(ChatsSlice.fetchChat(chatId));
  const isAdmin = useSelector((state: RootState) => ChatsSlice.selectIsAdmin(state, chatId, Storage.readUserId()!));
  const publicity = useSelector((state: RootState) => ChatsSlice.selectPublicity(state, chatId));
  if (publicity === undefined) return <Spin size='small' />;
  // FIXME: Doesn't re-render when <chatId> changes.
  return (
    <Form name='updatePublicity' layout='inline' initialValues={{ publicity }}>
      <PublicityRadioGroup
        isInvitableDisabled={!isAdmin || publicity === 'PUBLIC'}
        isNotInvitableDisabled={!isAdmin || publicity === 'PUBLIC'}
        isPublicDisabled
        onChange={({ target }) => operateSetPublicity(chatId, target.value)}
      />
    </Form>
  );
}

async function operateSetPublicity(chatId: number, isInvitable: boolean): Promise<void> {
  const response = await setPublicity(chatId, isInvitable);
  if (response?.setPublicity === null) message.success('Publicity updated.', 3);
  else if (response?.setPublicity.__typename === 'MustBeAdmin')
    message.error('You must be an admin to update the publicity.', 5);
}

interface InvalidChatId {
  readonly __typename: 'InvalidChatId';
}

interface SetPublicityResult {
  readonly setPublicity: InvalidChatId | MustBeAdmin | null;
}

interface MustBeAdmin {
  readonly __typename: 'MustBeAdmin';
}

async function setPublicity(chatId: number, isInvitable: boolean): Promise<SetPublicityResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation SetPublicity($chatId: Int!, $isInvitable: Boolean!) {
              setPublicity(chatId: $chatId, isInvitable: $isInvitable) {
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
