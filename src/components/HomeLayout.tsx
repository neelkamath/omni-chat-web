import React, {ReactElement, ReactNode} from 'react';
import {Layout, Menu, Typography} from 'antd';
import {Link} from 'react-router-dom';
import {
  CodeOutlined,
  HomeOutlined,
  LoginOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import {Storage} from '../Storage';
import SupportSection from './SupportSection';

export interface HomeLayoutProps {
  readonly children: ReactNode;
}

export default function HomeLayout({children}: HomeLayoutProps): ReactElement {
  return (
    <Layout>
      <Layout.Header>
        <HeaderMenu/>
      </Layout.Header>
      <Layout.Content>{children}</Layout.Content>
      <Layout.Footer>
        <SupportSection/>
      </Layout.Footer>
    </Layout>
  );
}

function HeaderMenu(): ReactElement {
  return (
    <Menu
      theme="dark"
      mode="horizontal"
      defaultSelectedKeys={[location.pathname]}
    >
      <Menu.Item key="/">
        <Link component={Typography.Link} to="/">
          <HomeOutlined/> Home
        </Link>
      </Menu.Item>
      <Menu.Item key="/register">
        <Link component={Typography.Link} to="/register">
          <UserAddOutlined/> Register
        </Link>
      </Menu.Item>
      <Menu.Item key="/sign-in">
        <Typography.Link
          onClick={() =>
            (location.href =
              Storage.readTokenSet() === undefined ? '/sign-in' : '/chat')
          }
        >
          <LoginOutlined/> Sign In
        </Typography.Link>
      </Menu.Item>
      <Menu.Item key="/developers">
        <Link component={Typography.Link} to="/developers">
          <CodeOutlined/> Developers
        </Link>
      </Menu.Item>
    </Menu>
  );
}
