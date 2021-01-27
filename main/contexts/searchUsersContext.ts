import {AccountsConnection} from '../api/networking/graphql/models';
import {createContext, useState} from 'react';

/** The query users were searched by. `undefined` if users haven't been searched yet. */
export type SearchUsersContextQuery = string | undefined;

export interface SearchUsersContextQuerySetter {
    (query: string): void;
}

/** `undefined` indicates no users have been searched for yet. An empty array indicates there were no search results. */
export type SearchUsersContextResults = AccountsConnection | undefined;

/** Replaces previous search results (if there are any) with `accounts`. */
export interface SearchUsersContextResultsReplacer {
    (accounts: AccountsConnection): void;
}

/** Adds the `accounts` to the existing search results (there must be preexisting results). */
export interface SearchUsersContextResultsAppender {
    (accounts: AccountsConnection): void;
}

export interface SearchUsersContextData {
    readonly query: SearchUsersContextQuery;
    readonly setQuery: SearchUsersContextQuerySetter;
    readonly accounts: SearchUsersContextResults;
    readonly replaceAccounts: SearchUsersContextResultsReplacer;
    readonly addAccounts: SearchUsersContextResultsAppender;
}

/**
 * Context for the search results of users. It's `undefined` when it's used outside of it's
 * {@link SearchUsersContext.Provider}.
 */
export const SearchUsersContext = createContext<SearchUsersContextData | undefined>(undefined);

/** Hook for {@link SearchUsersContext}. */
export function useSearchUsersContext(): SearchUsersContextData {
    const [query, setQuery] = useState<string | undefined>(undefined);
    const [accounts, setAccounts] = useState<SearchUsersContextResults>(undefined);
    const replaceAccounts: SearchUsersContextResultsReplacer = (newAccounts) => setAccounts(newAccounts);
    const addAccounts: SearchUsersContextResultsAppender = (newAccounts) => {
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
