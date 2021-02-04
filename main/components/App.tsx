import React, {ReactElement} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import HomePage from './HomePage';
import RegistrationPage from './registration-page/RegistrationPage';
import SignInPage from './sign-in-page/SignInPage';
import ChatPage from './chat-page/ChatPage';
import DevelopersPage from './DevelopersPage';

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
                <Route exact path='/developers'>
                    <DevelopersPage/>
                </Route>
            </Switch>
        </BrowserRouter>
    );
}
