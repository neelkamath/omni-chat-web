import React, {ReactElement} from 'react';
import {Typography} from 'antd';
import HomeLayout from './homeLayout';

export default function ContactPage(): ReactElement {
    return (
        <>
            <HomeLayout>
                <Typography.Title level={2}>Contact</Typography.Title>
                <Typography.Text>
                    Contact {' '}
                    <Typography.Link>neelkamathonline@gmail.com</Typography.Link> {' '}
                    for support, business queries, feature requests, or bug reports.
                </Typography.Text>
            </HomeLayout>
        </>
    );
}
