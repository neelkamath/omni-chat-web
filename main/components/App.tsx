import React, {ReactElement} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import HomePage from './HomePage';
import RegistrationPage from './RegistrationPage';
import SignInPage from './SignInPage';
import ChatPage from './ChatPage';

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
