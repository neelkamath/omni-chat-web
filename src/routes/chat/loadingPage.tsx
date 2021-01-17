import React, {ReactElement} from 'react';
import {Row, Spin} from 'antd';

export default function LoadingPage(): ReactElement {
    return (
        <Row style={{position: 'absolute', top: '50%', left: '50%'}}>
            <Spin size='large'/>
        </Row>
    );
}
