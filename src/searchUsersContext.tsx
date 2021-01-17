import {Account} from './api/graphQlApi/models';
import {createContext, useState} from 'react';

/** `undefined` indicates no users have been searched for yet. An empty array indicates there were no search results. */
export type SearchUsersData = undefined | Account[];

/** Sets the `accounts` to `newAccounts`, clearing the previous value. */
export interface ReplaceAccounts {
    (newAccounts: Account[]): void;
}

export interface SearchUsersContextData {
    readonly accounts: SearchUsersData;
    readonly replaceAccounts: ReplaceAccounts;
}

/**
 * Context for the search results of users. It's `undefined` when it's used outside of it's
 * {@link SearchUsersContext.Provider}.
 */
export const SearchUsersContext = createContext<undefined | SearchUsersContextData>(undefined);

export function useSearchUsersContext(): [SearchUsersData, ReplaceAccounts] {
    const [accounts, setAccounts] = useState<SearchUsersData>(undefined);
    const replaceAccounts: ReplaceAccounts = (newAccounts) => setAccounts(newAccounts);
    return [accounts, replaceAccounts];
}
