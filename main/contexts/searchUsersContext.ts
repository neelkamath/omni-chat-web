import {AccountsConnection} from '../api/networking/graphql/models';
import {createContext, useState} from 'react';

export interface SearchUsersContextData {
    /** The query users were searched by. Initially an empty string. */
    readonly query: string;
    /** Overwrites {@link SearchUsersContextData.query}. */
    readonly setQuery: (query: string) => void;
    /** Users searched for. `undefined` before the first search. */
    readonly users: AccountsConnection | undefined;
    /** Replaces any previous search results with the `connection`. */
    readonly replaceUsers: (connection: AccountsConnection) => void;
    /** Adds the `connection` to the existing search results (there must be existing search results). */
    readonly addUsers: (connection: AccountsConnection) => void;
}

/** Context for user search results. `undefined` when used outside of it's {@link SearchUsersContext.Provider}. */
export const SearchUsersContext = createContext<SearchUsersContextData | undefined>(undefined);

/** React hook for {@link SearchUsersContext}. */
export function useSearchUsersContext(): SearchUsersContextData {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<AccountsConnection | undefined>();
    const replaceUsers = (connection: AccountsConnection) => setUsers(connection);
    const addUsers = (connection: AccountsConnection) => {
        setUsers({
            edges: [...users!.edges, ...connection.edges],
            pageInfo: {
                hasNextPage: connection.pageInfo.hasNextPage,
                hasPreviousPage: users!.pageInfo.hasPreviousPage,
                startCursor: connection.pageInfo.startCursor,
                endCursor: connection.pageInfo.endCursor,
            },
        });
    };
    return {query, setQuery, users: users, replaceUsers, addUsers};
}
