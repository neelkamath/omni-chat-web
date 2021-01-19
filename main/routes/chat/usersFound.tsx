import React, {ReactElement, useContext, useEffect, useState} from 'react';
import {SearchUsersContext} from '../../searchUsersContext';
import {Avatar, Card, Empty, List, Typography} from 'antd';
import {Account} from '../../api/graphQlApi/models';
import {LoadingOutlined, UserOutlined} from '@ant-design/icons';
import {RestApi} from '../../api/restApi';
import {ConnectionError, InternalServerError, NonexistentUserIdError} from '../../api/errors';

export default function UsersFound(): ReactElement {
    const context = useContext(SearchUsersContext);
    if (context!.accounts === undefined) return <></>;
    const cards = context!.accounts.map((account) =>
        <Card key={account.id}>
            <UserFound account={account}/>
        </Card>
    );
    return cards.length === 0 ? <Empty/> : <>{cards}</>;
}

interface UserFoundProps {
    readonly account: Account;
}

function UserFound({account}: UserFoundProps): ReactElement {
    const [avatar, setAvatar] = useState(<LoadingOutlined/>);
    useEffect(() => {
        getProfilePic(account.id).then((pic) => {
            if (pic !== null) setAvatar(pic);
        });
    }, []);
    return (
        <Card.Meta title={account.username} avatar={avatar} description={<UserFoundDescription account={account}/>}/>
    );
}

async function getProfilePic(userId: number): Promise<ReactElement | null> {
    let pic;
    try {
        pic = await RestApi.getProfilePic(userId);
    } catch (error) {
        if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        /*
         A <NonexistentUserIdError> will be caught here if a user who was to be displayed in the search results
         deleted their account in between being searched, and having the profile pic displayed. Since this rarely ever
         happens, and no harm comes from leaving the search result up, we ignore this possibility.
         */
        else if (error ! instanceof NonexistentUserIdError) throw error;
        return null;
    }
    return <Avatar size='large' src={pic === null ? <UserOutlined/> : URL.createObjectURL(pic)}/>;
}

interface UserFoundDescriptionProps {
    readonly account: Account;
}

function UserFoundDescription({account}: UserFoundDescriptionProps): ReactElement {
    const name = `${account.firstName} ${account.lastName}`;
    return (
        <List>
            {
                name.trim().length > 0 && (
                    <List.Item>
                        <Typography.Text strong>Name</Typography.Text>: {name}
                    </List.Item>
                )
            }
            <List.Item>
                <Typography.Text strong>Email address</Typography.Text>: {account.emailAddress}
            </List.Item>
            {
                account.bio.trim().length > 0 && (
                    <List.Item>
                        <Typography.Text strong>Bio</Typography.Text>: {account.bio}
                    </List.Item>
                )
            }
        </List>
    );
}
