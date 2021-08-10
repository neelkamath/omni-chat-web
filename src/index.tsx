import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import setOnline from './setOnline';

// TODO: Add illustrations to every chat page's section such as the contacts section.
// FIXME: Deleting your account works but an error reporter pops up.
// TODO: Ensure mic access is switched off when not recording audio.
/*
FIXME: When you're on the group chat info page, log out, and then log in with a different account, the previous user's
 view is rendered.
 */

ReactDOM.render(<App />, document.querySelector('#root'));
/*
Make the user offline if they manually navigate away from the chat page. We must use the <beforeunload> event because
asynchronous operations don't complete in the <unload> event.
 */
addEventListener('beforeunload', () => setOnline(false));
