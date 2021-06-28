import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import setOnline from './setOnline';

// FIXME: Viewing a public chat the user isn't in doesn't yield updates.
// FIXME: Messages from new private chats don't show up.
// FIXME: I think the account doesn't actually get deleted when you delete it, and have a private chat.
// FIXME: After sending a text message, the focus on the text field gets lost.

ReactDOM.render(<App />, document.querySelector('#root'));
/*
Make the user offline if they manually navigate away from the chat page. We must use the <beforeunload> event because
asynchronous operations don't complete in the <unload> event.
 */
addEventListener('beforeunload', () => setOnline(false));
