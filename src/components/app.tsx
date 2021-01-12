import React, {ReactElement} from 'react';
import HomePage from './homePage';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import SignInPage from './signInPage';
import RegistrationPage from './registrationPage';
import ChatPage from './chatPage';

export default function App(): ReactElement {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path='/'>
                    <HomePage/>
                </Route>
                <Route exact path='/register'>
                    <RegistrationPage/>
                </Route>
                <Route exact path='/sign-in'>
                    <SignInPage/>
                </Route>
                <Route exact path='/chat'>
                    <ChatPage/>
                </Route>
            </Switch>
        </BrowserRouter>
    );
}
