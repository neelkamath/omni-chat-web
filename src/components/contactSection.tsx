import React, {ReactElement} from 'react';
import {Typography} from 'antd';

export default function ContactSection(): ReactElement {
    return (
        <Typography.Text>
            Contact {' '}
            <Typography.Link>neelkamathonline@gmail.com</Typography.Link> {' '}
            for support, business queries, feature requests, or bug reports.
        </Typography.Text>
    );
}
