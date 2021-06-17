import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import setOnline from './setOnline';

// TODO: Ensure refreshing expired access tokens work when first opening the page.
// FIXME: Viewing a public chat the user isn't in doesn't yield updates.
// TODO: Don't hardcode your email address for bug reports.

ReactDOM.render(<App />, document.querySelector('#root'));
/*
Make the user offline if they manually navigate away from the chat page. We must use the <beforeunload> event because
asynchronous operations don't complete in the <unload> event.
 */
addEventListener('beforeunload', () => setOnline(false));
