import React, {ReactElement} from 'react';
import {Image, Typography} from 'antd';
import contactUsImage from '../static/illustrations/contact_us.svg';
import SupportSection from './SupportSection';

export default function ChatPageLayoutSupportSection(): ReactElement {
    return (
        <>
            <Typography.Title>Support</Typography.Title>
            <SupportSection/>
            <Image preview={false} alt='Contact us' src={contactUsImage}/>
        </>
    );
}
