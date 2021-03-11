import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {MutationsApiWrapper} from './api/MutationsApiWrapper';

// TODO: Test every LOC to verify whether it works.
// TODO: Ensure subscriptions reconnect if the internet reconnects.
// TODO: Use GraphQL properly by only querying relevant fields.

ReactDOM.render(<App/>, document.querySelector('#root'));
/*
We must use the <beforeunload> instead of <unload> event because otherwise the
asynchronous operation won't complete.
 */
addEventListener('beforeunload', async () => {
  // Make the user offline if they manually navigate away from the chat page.
  await MutationsApiWrapper.setOnline(false);
});
