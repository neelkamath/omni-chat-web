import React, {ReactElement} from 'react';
import {Layout, Menu, Typography} from 'antd';
import {Link} from 'react-router-dom';
import {HomeOutlined, LoginOutlined, UserAddOutlined} from '@ant-design/icons';
import * as storage from '../storage';

export interface HomeLayoutProps {
    readonly children: React.ReactNode;
}

export default function HomeLayout(props: HomeLayoutProps): ReactElement {
    return (
        <Layout>
            <Layout.Header>
                <Menu theme='dark' mode='horizontal' defaultSelectedKeys={[location.pathname]}>
                    <Menu.Item key='/'>
                        <Link component={Typography.Link} to='/'>
                            <HomeOutlined/> Home
                        </Link>
                    </Menu.Item>
                    <Menu.Item key='/register'>
                        <Link component={Typography.Link} to='/register'>
                            <UserAddOutlined/> Register
                        </Link>
                    </Menu.Item>
                    <Menu.Item key='/sign-in'>
                        <Typography.Link
                            onClick={() => location.href = storage.readTokenSet() === null ? '/sign-in' : '/chat'}
                        >
                            <LoginOutlined/> Sign In
                        </Typography.Link>
                    </Menu.Item>
                </Menu>
            </Layout.Header>
            <Layout.Content style={{padding: 16}}>
                {props.children}
            </Layout.Content>
        </Layout>
    );
}
