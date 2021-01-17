import React, {ReactElement} from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import HomePage from './routes/home/homePage';
import RegistrationPage from './routes/register/registrationPage';
import SignInPage from './routes/signIn/signInPage';
import ChatPage from './routes/chat/chatPage';

ReactDOM.render(<App/>, document.querySelector('#root'));

function App(): ReactElement {
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
