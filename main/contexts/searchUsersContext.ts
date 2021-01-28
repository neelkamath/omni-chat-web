import {AccountsConnection} from '../api/networking/graphql/models';
import {createContext, useEffect, useState} from 'react';
import * as queriesApi from '../api/wrappers/queriesApi';

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
    /** The query users were searched by. `undefined` if users haven't been searched yet. */
    readonly query: string | undefined;
    readonly setQuery: (query: string) => void;
    readonly accounts: SearchUsersContextResults;
    readonly replaceAccounts: SearchUsersContextResultsReplacer;
    readonly addAccounts: SearchUsersContextResultsAppender;
    /** The user ID of every contact the user has. */
    readonly contacts: number[];
    /** Fetches the contacts to overwrite `contactsPromise`. */
    readonly updateContacts: () => void;
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
    const [contacts, setContacts] = useState<number[]>([]);
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
    const updateContacts = () => {
        queriesApi.readContacts().then((response) => {
            setContacts(response === null ? [] : response.edges.map((edge) => edge.node.id));
        });
    };
    useEffect(() => updateContacts(), []);
    return {query, setQuery, accounts, replaceAccounts, addAccounts, contacts, updateContacts};
}
