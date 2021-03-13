import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { MutationsApiWrapper } from './api/MutationsApiWrapper';

// TODO: Test every LOC in ./chat-page/ and outside /src/components/ to verify whether it works.
// TODO: Ensure subscriptions reconnect if the internet reconnects.
// TODO: Use GraphQL properly by only querying relevant fields.
// TODO: Version Omni Chat Web since it depends on certain versions of Omni Chat Backend.
// TODO: Replace double-quotes with single-quotes where possible.

ReactDOM.render(<App />, document.querySelector('#root'));
// We must use the <beforeunload> instead of <unload> event because otherwise the asynchronous operation won't complete.
addEventListener('beforeunload', async () => {
  // Make the user offline if they manually navigate away from the chat page.
  await MutationsApiWrapper.setOnline(false);
});
