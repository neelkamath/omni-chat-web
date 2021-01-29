import {createContext, useEffect, useState} from 'react';
import {Account} from '../api/networking/graphql/models';
import * as queriesApi from '../api/wrappers/queriesApi';

export interface ContactsContextData {
    /** The user ID of every contact the user has. `undefined` initially. */
    readonly contacts: Account[] | undefined;
    /** Fetches the contacts to overwrite `contactsPromise`. */
    readonly setContacts: (contacts: Account[]) => void;
}

/** Context for the user's contacts. `undefined` when used outside of it's {@link ContactsContext.Provider}. */
export const ContactsContext = createContext<ContactsContextData | undefined>(undefined);

/**
 * React hook for {@link ContactsContext}. Sets {@link ContactsContextData.contacts} to the user's contacts on the first
 * run.
 */
export function useContactsContext(): ContactsContextData {
    const [contacts, setContacts] = useState<Account[] | undefined>(undefined);
    useEffect(() => {
        queriesApi.readContacts().then((contacts) => {
            if (contacts !== null) setContacts(contacts.edges.map((edge) => edge.node));
        });
    }, []);
    return {contacts, setContacts};
}
