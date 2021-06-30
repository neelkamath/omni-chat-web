import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import setOnline from './setOnline';

// FIXME: Viewing a public chat the user isn't in doesn't yield updates.
// FIXME: When a user gets added to a public chat, the message creator still says they aren't added if they're already viewing the chat.

ReactDOM.render(<App />, document.querySelector('#root'));
/*
Make the user offline if they manually navigate away from the chat page. We must use the <beforeunload> event because
asynchronous operations don't complete in the <unload> event.
 */
addEventListener('beforeunload', () => setOnline(false));
