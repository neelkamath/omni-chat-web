import React, {ReactElement} from 'react';
import {Image, Space} from 'antd';
import contactUsImage from '../../images/contact-us.svg';
import SupportSection from '../SupportSection';

export default function ChatPageSupportSection(): ReactElement {
    return (
        <Space style={{padding: 16}}>
            <SupportSection/>
            <Image preview={false} alt='Contact us' src={contactUsImage}/>
        </Space>
    );
}
