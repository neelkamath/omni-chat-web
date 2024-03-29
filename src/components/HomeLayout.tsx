import React, { ReactElement, ReactNode } from 'react';
import { Layout, Menu, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { CodeOutlined, HomeOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { Storage } from '../Storage';
import SupportSection from './SupportSection';

export interface HomeLayoutProps {
  readonly children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps): ReactElement {
  return (
    <Layout style={{ minHeight: '100%' }}>
      <Layout.Header>
        <HeaderMenu />
      </Layout.Header>
      <Layout.Content>{children}</Layout.Content>
      <Layout.Footer>
        <SupportSection />
      </Layout.Footer>
    </Layout>
  );
}

function HeaderMenu(): ReactElement {
  return (
    <Menu theme='dark' mode='horizontal' defaultSelectedKeys={[location.hash]}>
      <Menu.Item key='#/'>
        <Link component={Typography.Link} to='/'>
          <Space>
            <HomeOutlined /> Home
          </Space>
        </Link>
      </Menu.Item>
      <Menu.Item key='#/register'>
        <Link component={Typography.Link} to='/register'>
          <Space>
            <UserAddOutlined /> Register
          </Space>
        </Link>
      </Menu.Item>
      <Menu.Item key='#/sign-in'>
        <Link component={Typography.Link} to={Storage.readTokenSet() === undefined ? '/sign-in' : '/chat'}>
          <Space>
            <LoginOutlined /> Sign In
          </Space>
        </Link>
      </Menu.Item>
      <Menu.Item key='#/developers'>
        <Link component={Typography.Link} to='/developers'>
          <Space>
            <CodeOutlined /> Developers
          </Space>
        </Link>
      </Menu.Item>
    </Menu>
  );
}
