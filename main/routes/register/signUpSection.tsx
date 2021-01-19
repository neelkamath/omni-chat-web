import React, {ReactElement, useState} from 'react';
import {Button, Col, Form, Image, Input, message, Row, Typography} from 'antd';
import completingImage from '../../static/illustrations/completing.svg';
import {Mutations} from '../../api/graphQlApi/mutations';
import {
    BioScalarError,
    ConnectionError,
    EmailAddressTakenError,
    InternalServerError,
    InvalidDomainError,
    NameScalarError,
    PasswordScalarError,
    UsernameScalarError,
    UsernameTakenError,
} from '../../api/errors';

export default function SignUpSection(): ReactElement {
    return (
        <Row gutter={16} justify='space-around' align='middle'>
            <Col span={12}>
                <Typography.Title level={2}>Sign Up</Typography.Title>
                <SignUpForm/>
            </Col>
            <Col span={12}>
                <Image preview={false} alt='Completing' src={completingImage}/>
            </Col>
        </Row>
    );
}

interface SignUpData {
    readonly username: string;
    readonly password: string;
    readonly 'email-address': string;
    readonly 'first-name'?: string;
    readonly 'last-name'?: string;
    readonly 'bio'?: string;
}

function SignUpForm(): ReactElement {
    const [loading, setLoading] = useState(false);
    const onFinish = async (formData: SignUpData) => {
        setLoading(true);
        await createAccount(formData);
        setLoading(false);
    };
    return (
        <Form onFinish={onFinish} name='sign-up' layout='vertical'>
            <Form.Item name='username' label='Username' rules={[{required: true, message: 'Enter a username.'}]}>
                <Input/>
            </Form.Item>
            <Form.Item name='password' label='Password' rules={[{required: true, message: 'Enter a password.'}]}>
                <Input.Password/>
            </Form.Item>
            <Form.Item
                name='email-address'
                label='Email address'
                rules={[{required: true, message: 'Enter an email address.'}]}
            >
                <Input type='email'/>
            </Form.Item>
            <Form.Item name='first-name' label='First name' initialValue=''>
                <Input/>
            </Form.Item>
            <Form.Item name='last-name' label='Last name' initialValue=''>
                <Input/>
            </Form.Item>
            <Form.Item name='bio' label='Bio' initialValue=''>
                <Input.TextArea/>
            </Form.Item>
            <Form.Item>
                <Button type='primary' htmlType='submit' loading={loading}>Submit</Button>
            </Form.Item>
        </Form>
    );
}

async function createAccount(data: SignUpData): Promise<void> {
    try {
        await Mutations.createAccount({
            username: data.username,
            password: data.password,
            emailAddress: data['email-address'],
            firstName: data['first-name'],
            lastName: data['last-name'],
            bio: data.bio,
        });
    } catch (error) {
        if (error instanceof UsernameScalarError) await UsernameScalarError.display();
        else if (error instanceof PasswordScalarError) await PasswordScalarError.display();
        else if (error instanceof NameScalarError) await NameScalarError.display();
        else if (error instanceof BioScalarError) await BioScalarError.display();
        else if (error instanceof InvalidDomainError) await InvalidDomainError.display();
        else if (error instanceof UsernameTakenError) await UsernameTakenError.display();
        else if (error instanceof EmailAddressTakenError) await EmailAddressTakenError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    message.success('Account created. Check your email for an account verification code.', 5);
}
