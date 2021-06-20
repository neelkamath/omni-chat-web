# Install

1. Install [Node.js 14](https://nodejs.org/en/download/).
1. Clone the repo using one of the following methods:
   - SSH: `git clone git@github.com:neelkamath/omni-chat-web.git`
   - HTTPS: `git clone https://github.com/neelkamath/omni-chat-web.git`
1. `cd omni-chat-web`
1. `npm i`
1. Configure the production environment:
   1. Copy the [`.env.prod`](docs/.env.prod) file to the project's root directory.
   1. If you're not running the Omni Chat API on `localhost`, change the value of the `API_URL` key (e.g., `localhost:8080`, `example.com/api`).
   1. It's highly recommended for the API server to have an SSL certificate but if not, change the values of the `HTTP` and `WS` keys to `http` and `ws` respectively.
   1. Set the value of `SUPPORT_EMAIL_ADDRESS` to the email address which will displayed to users when they require help such as when they want to report a bug.
