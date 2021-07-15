import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import setOnline from './setOnline';

ReactDOM.render(<App />, document.querySelector('#root'));
/*
Make the user offline if they manually navigate away from the chat page. We must use the <beforeunload> event because
asynchronous operations don't complete in the <unload> event.
 */
addEventListener('beforeunload', () => setOnline(false));
