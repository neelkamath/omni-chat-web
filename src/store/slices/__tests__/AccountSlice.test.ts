import { AnyAction } from '@reduxjs/toolkit';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { AccountSlice } from '../AccountSlice';
import { QueriesApiWrapper } from '../../../api/QueriesApiWrapper';

const mockStore = configureMockStore([thunk]);
jest.mock('../../../api/QueriesApiWrapper');
// @ts-ignore
QueriesApiWrapper.readAccount.mockResolvedValue({
  id: 1,
  username: 'johndoe',
  emailAddress: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  bio: '',
});

describe('AccountSlice', () => {
  describe('fetchAccount()', () => {
    it('fetches the account', async () => {
      const store = mockStore({
        account: { isLoading: false },
      });
      await store.dispatch((AccountSlice.fetchAccount() as unknown) as AnyAction);
      expect(store.getActions()).toEqual([3]);
    });
  });
});
