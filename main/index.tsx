import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import * as mutationsApi from './api/wrappers/mutationsApi';

ReactDOM.render(<App/>, document.querySelector('#root'));
// We must use the <beforeunload> instead of <unload> event because otherwise the asynchronous operation won't complete.
addEventListener('beforeunload', async () => {
    // Make the user offline if they manually navigate away from the chat page.
    await mutationsApi.setOnlineStatus(false);
});
