import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { Storage } from './Storage';
import { httpApiConfig, operateGraphQlApi } from './api';
import { setOnline } from '@neelkamath/omni-chat';

// TODO: Before committing, unlink the @neelkamath/omni-chat lib, and install it to the dependencies instead.
// TODO: When supporting messages, show a Markdown guide so users know how to format.
// TODO: Test on all major browsers.
// TODO: Use GraphQL properly by only querying relevant fields.

ReactDOM.render(<App />, document.querySelector('#root'));
// We must use the <beforeunload> event because asynchronous operations don't complete in the <unload> event.
addEventListener('beforeunload', () => {
  // Make the user offline if they manually navigate away from the chat page.
  const token = Storage.readAccessToken();
  if (token !== undefined) operateGraphQlApi(() => setOnline(httpApiConfig, token, false));
});
