import React, {ReactElement, useState} from 'react';
import {Button, Col, Form, Image, Input, Row, Typography} from 'antd';
import signInImage from '../../static/illustrations/sign_in.svg';
import * as queries from '../../api/graphQlApi/queries';
import {
    CONNECTION_ERROR,
    displayConnectionError,
    displayIncorrectPasswordError,
    displayNonExistentUserError,
    displayUnverifiedEmailAddressError,
    INCORRECT_PASSWORD_ERROR,
    NONEXISTENT_USER_ERROR,
    UNVERIFIED_EMAIL_ADDRESS_ERROR
} from '../../api/errors';
import * as storage from '../../storage';

export default function SignInSection(): ReactElement {
    return (
        <Row gutter={16} justify='space-around' align='middle'>
            <Col span={12}>
                <Typography.Title level={2}>Sign In</Typography.Title>
                <SignInForm/>
            </Col>
            <Col span={7}>
                <Image preview={false} alt='Sign In' src={signInImage}/>
            </Col>
        </Row>
    );
}

interface SignInData {
    readonly username: string;
    readonly password: string;
}

function SignInForm(): ReactElement {
    const [loading, setLoading] = useState(false);
    const onFinish = async (formData: SignInData) => {
        setLoading(true);
        await signIn(formData);
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='sign-in' layout='vertical'>
            <Form.Item name='username' label='Username' rules={[{required: true, message: 'Enter your username.'}]}>
                <Input/>
            </Form.Item>
            <Form.Item name='password' label='Password' rules={[{required: true, message: 'Enter your password.'}]}>
                <Input.Password/>
            </Form.Item>
            <Form.Item>
                <Button type='primary' htmlType='submit' loading={loading}>Submit</Button>
            </Form.Item>
        </Form>
    );
}

async function signIn(data: SignInData): Promise<void> {
    let tokenSet;
    try {
        tokenSet = await queries.requestTokenSet(data);
    } catch (error) {
        switch (error) {
            case CONNECTION_ERROR:
                await displayConnectionError();
                break;
            case NONEXISTENT_USER_ERROR:
                await displayNonExistentUserError();
                break;
            case UNVERIFIED_EMAIL_ADDRESS_ERROR:
                await displayUnverifiedEmailAddressError();
                break;
            case INCORRECT_PASSWORD_ERROR:
                await displayIncorrectPasswordError();
        }
        return;
    }
    storage.saveTokenSet(tokenSet);
    location.href = '/chat';
}
