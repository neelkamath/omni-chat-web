import {AccountsConnection} from './api/networking/graphql/models';
import {createContext, useState} from 'react';

/** The query users were searched by. `undefined` if users haven't been searched yet. */
export type UserSearchQuery = string | undefined;

export interface UserSearchQuerySetter {
    (query: string): void;
}

/** `undefined` indicates no users have been searched for yet. An empty array indicates there were no search results. */
export type UserSearchData = undefined | AccountsConnection;

/** Replaces any previous search results with `accounts`. */
export interface UserSearchResultsReplacer {
    (accounts: AccountsConnection): void;
}

/** Adds the `accounts` to the existing search results. */
export interface UserSearchAccountsAdder {
    (accounts: AccountsConnection): void;
}

export interface UserSearchContextData {
    readonly query: UserSearchQuery;
    readonly setQuery: UserSearchQuerySetter;
    readonly accounts: UserSearchData;
    readonly replaceAccounts: UserSearchResultsReplacer;
    readonly addAccounts: UserSearchAccountsAdder;
}

/**
 * Context for the search results of users. It's `undefined` when it's used outside of it's
 * {@link SearchUsersContext.Provider}.
 */
export const SearchUsersContext = createContext<undefined | UserSearchContextData>(undefined);

export function useSearchUsersContext(): UserSearchContextData {
    const [query, setQuery] = useState<string | undefined>(undefined);
    const [accounts, setAccounts] = useState<UserSearchData>(undefined);
    const replaceAccounts: UserSearchResultsReplacer = (newAccounts) => setAccounts(newAccounts);
    const addAccounts: UserSearchAccountsAdder = (newAccounts) => {
        setAccounts({
            edges: [...accounts!.edges, ...newAccounts.edges],
            pageInfo: {
                hasNextPage: newAccounts.pageInfo.hasNextPage,
                hasPreviousPage: accounts!.pageInfo.hasPreviousPage,
                startCursor: newAccounts.pageInfo.startCursor,
                endCursor: newAccounts.pageInfo.endCursor,
            },
        });
    };
    return {query, setQuery, accounts, replaceAccounts, addAccounts};
}
