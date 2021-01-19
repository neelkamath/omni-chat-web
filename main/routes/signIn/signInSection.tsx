import React, {ReactElement, useState} from 'react';
import {Button, Col, Form, Image, Input, Row, Typography} from 'antd';
import signInImage from '../../static/illustrations/sign_in.svg';
import {Queries} from '../../api/graphQlApi/queries';
import {
    ConnectionError,
    IncorrectPasswordError,
    InternalServerError,
    NonexistentUserError,
    PasswordScalarError,
    UnverifiedEmailAddressError,
    UsernameScalarError,
} from '../../api/errors';
import {Storage} from '../../storage';

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
        tokenSet = await Queries.requestTokenSet(data);
    } catch (error) {
        if (error instanceof UsernameScalarError) await UsernameScalarError.display();
        else if (error instanceof PasswordScalarError) await PasswordScalarError.display();
        else if (error instanceof NonexistentUserError) await NonexistentUserError.display();
        else if (error instanceof UnverifiedEmailAddressError) await UnverifiedEmailAddressError.display();
        else if (error instanceof IncorrectPasswordError) await IncorrectPasswordError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    Storage.saveTokenSet(tokenSet);
    location.href = '/chat';
}
