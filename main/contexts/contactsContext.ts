import {createContext, useState} from 'react';
import {Account} from '../api/networking/graphql/models';
import * as queriesApi from '../api/wrappers/queriesApi';

export interface ContactsContextData {
    /** The query to search contacts by. Initially an empty `string`. */
    readonly query: string;
    /** Overwrites {@link ContactsContextData.query}. */
    readonly setQuery: (query: string) => void;
    /** Initially `undefined`. */
    readonly contacts: Account[] | undefined;
    /**
     * Fetches every contact found using the {@link ContactsContextData.query} (i.e., no pagination is used), and then
     * sets {@link ContactsContextData.contacts} to it.
     */
    readonly updateContacts: () => Promise<void>;
}

/** Context for the user's contacts. `undefined` when used outside of it's {@link ContactsContext.Provider}. */
export const ContactsContext = createContext<ContactsContextData | undefined>(undefined);

/** React hook for {@link ContactsContext}. */
export function useContactsContext(): ContactsContextData {
    const [query, setQuery] = useState('');
    const [contacts, setContacts] = useState<Account[] | undefined>(undefined);
    const updateContacts = async () => {
        const response = await queriesApi.searchContacts(query);
        if (response !== null) setContacts(response.edges.map((edge) => edge.node));
    };
    return {query, setQuery, contacts, updateContacts};
}
