import React, {ReactElement, useContext, useState} from 'react';
import {Button, Empty, Form, Input, Space, Spin} from 'antd';
import {ContactsContext, useContactsContext} from '../../contexts/contactsContext';
import {SearchOutlined} from '@ant-design/icons';
import * as storage from '../../storage';
import UserCard from './UserCard';

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function ContactsSection(): ReactElement {
    return (
        <Space direction='vertical' style={{padding: 16}}>
            Search contacts by their name, username, or email address.
            <ContactsContext.Provider value={useContactsContext()}>
                <Space direction='vertical'>
                    <SearchContactsForm/>
                    <Contacts/>
                </Space>
            </ContactsContext.Provider>
        </Space>
    );
}

interface SearchContactsFormData {
    readonly query: string;
}

function SearchContactsForm(): ReactElement {
    const {query, setQuery, updateContacts} = useContext(ContactsContext)!;
    const [isLoading, setLoading] = useState(false);
    const onFinish = async ({query}: SearchContactsFormData) => {
        setLoading(true);
        setQuery(query);
        await updateContacts();
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='searchContacts' layout='inline'>
            <Form.Item name='query' initialValue={query}>
                <Input/>
            </Form.Item>
            <Form.Item>
                <Button loading={isLoading} type='primary' htmlType='submit' icon={<SearchOutlined/>}/>
            </Form.Item>
        </Form>
    );
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
function Contacts(): ReactElement {
    const {contacts, updateContacts} = useContext(ContactsContext)!;
    if (contacts === undefined) {
        // noinspection JSIgnoredPromiseFromCall
        updateContacts();
        return <Spin/>;
    }
    const cards = contacts
        .filter(({id}) => id !== storage.readUserId()!)
        .map((contact) => <UserCard key={contact.id} account={contact} onModalClose={updateContacts}/>);
    return cards.length === 0 ? <Empty/> : <Space direction='vertical'>{cards}</Space>;
}
