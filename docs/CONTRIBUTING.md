# Contributing

- This app supports the latest version of Chrome, Firefox, Safari, and Edge on desktops.
- "JWT" refers to [JSON Web Tokens](https://jwt.io/).
- When the user is signed in, the access token can be assumed to be valid because it's automatically refreshed
  periodically in the background. This means that if an API call results in an unauthorized error, either the user
  deleted their account, or an edge case which couldn't be handled occurred (e.g., the access token was deleted
  from `localStorage` because the browser's history was deleted). In such a case, the user must be logged out (i.e., the
  token set must be deleted, and the user must be redirected to the homepage).
- Operations in the [`graphQlApi`](src/api/graphQlApi) directory don't document the `first`, `after`, `last`,
  and `before` function parameters because it'd be repetitive. Refer to
  the [pagination docs](https://github.com/neelkamath/omni-chat/blob/v0.8.3/docs/api.md#pagination) instead.

## Installation

1. Install the [app](docs/install.md).
1. Configure the development environment:
    1. Copy the [`.env`](docs/.env) file to the project's root directory.
    1. If you're not running the Omni Chat API on `localhost`, change the value of the `API_URL` key (
       e.g., `localhost:8080`, `example.com/api`).
    1. If the API server has an SSL certificate, change the values of the `HTTP` and `WS` keys to `https://`
       and `wss://` respectively.

## Development

1. Either run the Omni Chat 0.8.3
   API [locally](https://github.com/neelkamath/omni-chat/blob/v0.8.3/docs/docker-compose.md) or in
   the [cloud](https://github.com/neelkamath/omni-chat/blob/v0.8.3/docs/cloud.md).
1. Run on http://localhost:1234: `npm run dev`

## Production

Here's how to test the production build:

1. Either run the Omni Chat 0.8.3
   API [locally](https://github.com/neelkamath/omni-chat/blob/v0.8.3/docs/docker-compose.md) or in
   the [cloud](https://github.com/neelkamath/omni-chat/blob/v0.8.3/docs/cloud.md).
1. Save a production build to `dist/`: `npm run build`
1. Serve the website which has been saved to `dist/`.

## Storage

[`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) is used to save data such as
access tokens. The following data may be saved:

|Key|Explanation|Example|
|---|---|---|
|`'accessToken'`|Access token (a JWT).|`'ey9.yfQ.Sfl'`|
|`'refreshToken'`|Refresh token (a JWT).|`'ey9.yfQ.Sfl'`|

## Conventions

- Each directory in [`src/routes/`](src/routes) contains the components used solely in its route. Directories are named
  after the routes using the camelCase naming convention. For example, the `/sign-in` route has its components in
  the `sign-in` directory. Components used across multiple routes (e.g., [`supportSection.tsx`](src/supportSection.tsx))
  , contexts (e.g., [`searchUsersContext.tsx`](src/searchUsersContext.tsx)), etc. must be placed
  outside [`src/routes/`](src/routes).
- Here's an example of how to name images when importing them in TypeScript: To import `happy_news.svg`, write:
    ```ts
    import happyNewsImage from './happy_news.svg';
    ```
- When importing from [`storage.ts`](src/storage.ts), [`restApi.ts`](src/api/restApi.ts)
  , [`queries.ts`](src/api/graphQlApi/queries.ts), [`mutations.ts`](src/api/graphQlApi/mutations.ts),
  and [`subscriptions.ts`](src/api/graphQlApi/subscriptions.ts), import the entire file under the file's name. This
  gives clarity, and prevents naming conflicts. For example, to use a function from [`restApi.ts`](src/api/restApi.ts),
  import it like this:
    ```ts
    import * as restApi from '../api/restApi';
    ```

## Styling

- The theme color is `#177DDC`.
- Only use icons from [antd icons](https://ant.design/components/icon/).
- Only use illustrations from [unDraw](https://undraw.co/). The illustration's theme color must match that of the app's.
- Padding from the edges of the screen, and between elements is `16px`.
