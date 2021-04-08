import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { Storage } from './Storage';
import { httpApiConfig, operateGraphQlApi } from './api';
import { setOnline } from '@neelkamath/omni-chat';

// TODO: Test that it works on supported browsers.
// TODO: Use GraphQL properly by only querying relevant fields.
/*
TODO: Once context messages have been implemented, test that if the context has been deleted, messages which replied to
 it no longer display the context, and that a message being created in reply to it has the context disappear with an
 appropriate warning message.
 */

ReactDOM.render(<App />, document.querySelector('#root'));
// We must use the <beforeunload> event because asynchronous operations don't complete in the <unload> event.
addEventListener('beforeunload', () => {
  // Make the user offline if they manually navigate away from the chat page.
  const token = Storage.readAccessToken();
  if (token !== undefined) operateGraphQlApi(() => setOnline(httpApiConfig, token, false));
});
