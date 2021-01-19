import React, {ReactElement} from 'react';
import HomeLayout from '../home/homeLayout';
import {Divider, Row} from 'antd';
import SignInSection from './signInSection';
import VerifyYourEmailAddressSection from './verifyYourEmailAddressSection';
import EmailPasswordResetCodeSection from './emailPasswordResetCodeSection';
import ResetPasswordSection from './resetPasswordSection';

export default function SignInPage(): ReactElement {
    return (
        <HomeLayout>
            <Row gutter={16} style={{padding: 16}}>
                <SignInSection/>
                <Divider/>
                <VerifyYourEmailAddressSection/>
                <Divider/>
                <EmailPasswordResetCodeSection/>
                <Divider/>
                <ResetPasswordSection/>
            </Row>
        </HomeLayout>
    );
}
