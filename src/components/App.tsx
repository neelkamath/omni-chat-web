import React, { ReactElement } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import HomePage from './home-page/HomePage';
import RegistrationPage from './registration-page/RegistrationPage';
import SignInPage from './sign-in-page/SignInPage';
import ChatPage from './chat-page/ChatPage';
import DevelopersPage from './DevelopersPage';
import store from '../store/store';
import { Provider } from 'react-redux';

export default function App(): ReactElement {
  return (
    <Provider store={store}>
      <Router />
    </Provider>
  );
}

function Router(): ReactElement {
  return (
    <HashRouter>
      <Switch>
        <Route exact path='/' component={HomePage} />
        <Route exact path='/register' component={RegistrationPage} />
        <Route exact path='/sign-in' component={SignInPage} />
        <Route exact path='/chat' component={ChatPage} />
        <Route exact path='/developers' component={DevelopersPage} />
      </Switch>
    </HashRouter>
  );
}
