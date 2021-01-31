# Contributing

- This app supports the latest version of Chrome, Firefox, Safari, and Edge on desktop.
- When the user is signed in, the access token can be assumed to be valid because it's automatically refreshed
  periodically in the background. This means that if an API call results in an unauthorized error, either the user
  deleted their account, or an edge case which couldn't be handled occurred (e.g., the access token was deleted
  from `localStorage` because the browser's history was deleted). In such a case, the user must be logged out (i.e., the
  token set must be deleted, and the user must be redirected to the homepage).
- The `first`, `after`, `last`, and `before` function parameters aren't documented throughout the codebase because it'd
  be repetitive. Refer to
  the [pagination docs](https://github.com/neelkamath/omni-chat/blob/v0.12.0/docs/api.md#pagination) instead.
- When changing the version of the Omni Chat API being used (e.g., updating the frontend to use v0.12.0 instead of
  v0.9.0), update the `API_VERSION` key in [`.env`](/docs/.env)

## Installation

1. Install the [app](install.md).
1. Configure the development environment:
    1. Copy the [`.env`](/docs/.env) file to the project's root directory.
    1. If you're not running the Omni Chat API on `localhost`, change the value of the `API_URL` key (
       e.g., `localhost:8080`, `example.com/api`).
    1. If the API server has an SSL certificate, change the values of the `HTTP` and `WS` keys to `https://`
       and `wss://` respectively.

## Development

1. Either run the Omni Chat 0.12.0
   API [locally](https://github.com/neelkamath/omni-chat/blob/v0.12.0/docs/docker-compose.md) or in
   the [cloud](https://github.com/neelkamath/omni-chat/blob/v0.12.0/docs/cloud.md).
1. Run on http://localhost:1234: `npm run dev`

## Linting

```
npm run lint
```

## Testing

```
npm t
```

- Tests mirror the [`main`](/main) directory. For example, the tests
  for [`main/api/graphQlApi/validators.ts`](/main/api/networking/graphql/validators.ts) are
  in [`test/api/graphQlApi/validators.test.ts`](/test/api/graphQlApi/validators.test.ts).
- Each function's tests are grouped with the name of the function passed to `describe()`. For example, the tests
  for `validateUsernameScalar()` are placed in `describe('validateUsernameScalar()')`.

## Production

Here's how to test the production build:

1. Either run the Omni Chat 0.12.0
   API [locally](https://github.com/neelkamath/omni-chat/blob/v0.12.0/docs/docker-compose.md) or in
   the [cloud](https://github.com/neelkamath/omni-chat/blob/v0.12.0/docs/cloud.md).
1. Save a production build to `dist/`: `npm run build`
1. Serve the website which has been saved to `dist/`.

## Storage

[`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) is used to save data such as
access tokens. The following data may be saved:

|Key|Explanation|Example|
|---|---|---|
|`'accessToken'`|Access token (a JWT).|`'ey9.yfQ.Sfl'`|
|`'refreshToken'`|Refresh token (a JWT).|`'ey9.yfQ.Sfl'`|

## Design

- The theme color is `#177DDC`.
- Only use icons from [antd icons](https://ant.design/components/icon/).
- Only use illustrations from [unDraw](https://undraw.co/). The illustration's theme color must match that of the app's.
  Name the image the same as the caption given on unDraw.
- Padding from the edges of the screen, and between elements is `16px`.

## Style Guide

- Here's an example of how to name images when importing them in TypeScript: To import `happy-news.svg`, write:
    ```ts
    import happyNewsImage from './happy-news.svg';
    ```
- Name TypeScript files having an `export default` using _PascalCase_. Name other TypeScript files using _camelCase_.
- Name directories and non-TypeScript files using _kebab-case_.
