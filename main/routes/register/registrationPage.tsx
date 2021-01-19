import React, {ReactElement} from 'react';
import {Divider, Row} from 'antd';
import HomeLayout from '../home/homeLayout';
import SignUpSection from './signUpSection';
import ResendEmailAddressVerificationCodeSection from './resendEmailAddressVerificationCodeSection';

export default function RegistrationPage(): ReactElement {
    return (
        <HomeLayout>
            <Row gutter={16} style={{padding: 16}}>
                <SignUpSection/>
                <Divider/>
                <ResendEmailAddressVerificationCodeSection/>
            </Row>
        </HomeLayout>
    );
}
