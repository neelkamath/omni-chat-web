import React, {ReactElement} from 'react';
import {Content, Header} from 'antd/lib/layout/layout';
import {Dropdown, Layout, Menu, Typography} from 'antd';
import {Link} from 'react-router-dom';
import {MenuOutlined} from '@ant-design/icons';

export interface HomeLayoutProps {
    readonly children: React.ReactNode;
}

export default function HomeLayout(props: HomeLayoutProps): ReactElement {
    return (
        <Layout>
            <Header>
                <Dropdown overlay={<HeaderMenu/>}>
                    <MenuOutlined/>
                </Dropdown>
            </Header>
            <Content style={{padding: 16}}>
                {props.children}
            </Content>
        </Layout>
    );
}

function HeaderMenu(): ReactElement {
    return (
        <Menu>
            <Menu.Item>
                <Link component={Typography.Link} to='/'>Home</Link>
            </Menu.Item>
            <Menu.Item>
                <Link component={Typography.Link} to='/register'>Register</Link>
            </Menu.Item>
            <Menu.Item>
                <Link component={Typography.Link} to='/sign-in'>Sign In</Link>
            </Menu.Item>
            <Menu.Item>
                <Link component={Typography.Link} to='/contact'>Contact</Link>
            </Menu.Item>
        </Menu>
    );
}
