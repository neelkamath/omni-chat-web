# Contributing

## Installation

1. Install the [app](install.md).
1. Configure the development environment:
   1. Copy the [`.env.development`](.env.development) file to the project's root directory.
   1. If you're not running the Omni Chat API on `localhost`, change the value of the `API_URL` key (e.g., `localhost:8080`, `example.com/api`).
   1. If the API server has an SSL certificate, change the values of the `HTTP` and `WS` keys to `https` and `wss` respectively.

## Development

1. Either run the Omni Chat 0.23.0 API [locally](https://github.com/neelkamath/omni-chat/blob/v0.23.0/docs/docker-compose.md) or in the [cloud](https://github.com/neelkamath/omni-chat/blob/v0.23.0/docs/cloud.md).
1. Run on http://localhost:1234: `npm run dev`

## Linting

- Check: `npm run lint`
- Check and fix: `npm run fix`

## Production

Here's how to test the production build:

1. Either run the Omni Chat 0.23.0 API [locally](https://github.com/neelkamath/omni-chat/blob/v0.23.0/docs/docker-compose.md) or in the [cloud](https://github.com/neelkamath/omni-chat/blob/v0.23.0/docs/cloud.md).
1. Save a production build to `dist/`: `npm run build`
1. Serve the website which has been saved to `dist/`.

## Storage

[`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) is used to save the following data:

| Key              | Explanation            | Example         |
| ---------------- | ---------------------- | --------------- |
| `'accessToken'`  | Access token (a JWT).  | `'ey9.yfQ.Sfl'` |
| `'refreshToken'` | Refresh token (a JWT). | `'5k9.yf7.f0l'` |

## Design

- The theme color is `#177DDC`.
- Only use icons from [Ant Design](https://ant.design/components/icon/).
- Only use illustrations from [unDraw](https://undraw.co/). The illustration's theme color must match that of the app's. Save the image to [`src/images/`](../src/images) with the name being the same as the caption given on unDraw.
- Padding from the edges of the screen, and between elements is `16px`.
- Each page must have a `min-height` of `100%` so that footers appear at the bottom of the page instead of below wherever the content ends, and the background color doesn't half-way through the screen. For example, [`HomeLayout.tsx`](../src/components/HomeLayout.tsx) has a `style={{ minHeight: '100%' }}` on its component.

## Style Guide

- Never use dynamic version ranges for dependencies because packages often break in newer versions. For example, when `npm install`ing a dependency, remove the caret from the version number it saved to `package.json`.
- Always use Redux instead of [React Context](https://reactjs.org/docs/context.html) for the following reasons:
  - It's consistent to store state only in one state manager.
  - Redux is faster.
  - When using React Context, you need to remember to keep the React component using it nested inside of it.
- Here's an example of how to name images when importing them in TypeScript: To import `happy-news.svg`, write:

  ```typescript
  import happyNewsImage from './happy-news.svg';
  ```

- Name TypeScript files having a main `export` the same as the export (e.g., [`logOut.ts`](../src/logOut.ts), [`App.tsx`](../src/components/App.tsx)). Name other TypeScript files using _camelCase_.
- Name directories and non-TypeScript files using _kebab-case_.
- Directories in [`src/components/`](../src/components) have a file named after the directory (e.g., [`src/components/chat-page`](../src/components/chat-page) contains [`ChatPage.tsx`](../src/component/chat-page/ChatPage.tsx)) which exports the only file needed outside its directory. The rest of the directory's files are only used within the directory.

## Support

This app supports the latest version of Chrome, Firefox, Safari, and Edge on desktop.

## Omni Chat API

When the user is signed in, the access token can be assumed to be valid because it's automatically refreshed periodically in the background. This means that if an API call results in an unauthorized error, either the user deleted their account, or an edge case which couldn't be handled occurred (e.g., the access token was deleted from `localStorage` because the browser's history was deleted). In such cases, the user must be logged out using [`logOut.ts`](../src/logOut.ts).
