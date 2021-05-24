import { Storage } from './Storage';
import { httpApiConfig, operateGraphQlApi } from './api';
import { queryOrMutate } from '@neelkamath/omni-chat';

/**
 * Does nothing if {@link Storage.readAccessToken} returns `undefined`, and sets the user's status to `isOnline` using
 * `Mutation.setOnline` otherwise.
 */
export default async function setOnline(isOnline: boolean): Promise<void> {
  const token = Storage.readAccessToken();
  if (token === undefined) return;
  await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation SetOnline($isOnline: Boolean!) {
              setOnline(isOnline: $isOnline)
            }
          `,
          variables: { isOnline },
        },
        token,
      ),
  );
}
