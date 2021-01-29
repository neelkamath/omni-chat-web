import React, {ReactElement, useContext, useState} from 'react';
import {Button, Empty, Form, Input, Space, Spin, Typography} from 'antd';
import {ContactsContext, useContactsContext} from '../contexts/contactsContext';
import * as queriesApi from '../api/wrappers/queriesApi';
import {SearchOutlined} from '@ant-design/icons';
import * as storage from '../storage';
import UserFound from './UserFound';

export default function ContactsSection(): ReactElement {
    return (
        <>
            <Typography.Paragraph>Search contacts by their name, username, or email address.</Typography.Paragraph>
            <ContactsContext.Provider value={useContactsContext()}>
                <Space direction='vertical'>
                    <SearchContactsForm/>
                    <ContactsFound/>
                </Space>
            </ContactsContext.Provider>
        </>
    );
}

function SearchContactsForm(): ReactElement {
    const {setContacts} = useContext(ContactsContext)!;
    const [loading, setLoading] = useState(false);
    const onFinish = async (data: any) => {
        setLoading(true);
        const contacts = await queriesApi.searchContacts(data.query);
        if (contacts !== null) setContacts(contacts.edges.map((edge) => edge.node));
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='searchContacts' layout='inline'>
            <Form.Item name='query' initialValue=''>
                <Input/>
            </Form.Item>
            <Form.Item>
                <Button loading={loading} type='primary' htmlType='submit' icon={<SearchOutlined/>}/>
            </Form.Item>
        </Form>
    );
}

function ContactsFound(): ReactElement {
    const {contacts, setContacts} = useContext(ContactsContext)!;
    if (contacts === undefined) return <Spin/>;
    const onContactStatusChange = async () => {
        const contacts = await queriesApi.readContacts();
        if (contacts !== null) setContacts(contacts.edges.map((edge) => edge.node));
    };
    const cards = contacts
        .filter(({id}) => id !== storage.readUserId()!)
        .map((contact) =>
            <UserFound
                key={contact.id}
                account={contact}
                isContact={contacts.includes(contact)}
                onContactStatusChange={onContactStatusChange}
            />
        );
    return cards.length === 0 ? <Empty/> : <>{cards}</>;
}
