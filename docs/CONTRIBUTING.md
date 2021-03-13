# Contributing

## Installation

1. Install the [app](install.md).
1. Configure the development environment:
   1. Copy the [`.env`](.env) file to the project's root directory.
   1. If you're not running the Omni Chat API on `localhost`, change the value of the `API_URL` key (e.g., `localhost:8080`, `example.com/api`).
   1. If the API server has an SSL certificate, change the values of the `HTTP` and `WS` keys to `https` and `wss` respectively.

## Development

1. Either run the Omni Chat 0.16.0 API [locally](https://github.com/neelkamath/omni-chat/blob/v0.16.0/docs/docker-compose.md) or in the [cloud](https://github.com/neelkamath/omni-chat/blob/v0.16.0/docs/cloud.md).
1. Run on http://localhost:1234: `npm run dev`

## Testing

```
npm t
```

## Linting

- Check: `npm run lint`
- Fix: `npm run fix`

## Production

Here's how to test the production build:

1. Either run the Omni Chat 0.16.0 API [locally](https://github.com/neelkamath/omni-chat/blob/v0.16.0/docs/docker-compose.md) or in the [cloud](https://github.com/neelkamath/omni-chat/blob/v0.16.0/docs/cloud.md).
1. Save a production build to `dist/`: `npm run build`
1. Serve the website which has been saved to `dist/`.

## Storage

[`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) is used to save data such as access tokens. The following data may be saved:

| Key              | Explanation            | Example         |
| ---------------- | ---------------------- | --------------- |
| `'accessToken'`  | Access token (a JWT).  | `'ey9.yfQ.Sfl'` |
| `'refreshToken'` | Refresh token (a JWT). | `'ey9.yfQ.Sfl'` |

## Design

- The theme color is `#177DDC`.
- Only use Ant Design components (i.e., don't use components from other design systems, or vanilla HTML components such as `<span>`).
- Only use icons from [Ant Design](https://ant.design/components/icon/).
- Only use illustrations from [unDraw](https://undraw.co/). The illustration's theme color must match that of the app's. Save the image to [`src/images/`](src/images) with the name being the same as the caption given on unDraw.
- Padding from the edges of the screen, and between elements is `16px`.

## Style Guide

- Group each function's test cases in a `describe()` block. See [`AccountSlice.test.ts`](src/store/slices/__tests__/AccountSlice.test.ts) for an example.
- Here's an example of how to name images when importing them in TypeScript: To import `happy-news.svg`, write:

  ```typescript
  import happyNewsImage from './happy-news.svg';
  ```

- Name TypeScript files having a main `export` the same as the export (e.g., [`logOut.ts`](src/logOut.ts), [`App.tsx`](src/components/App.tsx). Name other TypeScript files using _camelCase_.
- Name directories and non-TypeScript files using _kebab-case_.
- When using React Redux, the following boilerplate is occasionally required to dispatch an action:

  ```typescript
  function ProfilePic(): ReactElement {
    const dispatch = useDispatch();
    useEffect(() => {
      dispatch(PicsSlice.fetchPic({ id: Storage.readUserId()!, type: 'PROFILE_PIC' }));
    }, [dispatch, userId]);
  }
  ```

  In order to remove this boilerplate, [slices](../src/store/slices) must provide React hooks such as the following:

  ```typescript
  function useFetchPic(data: PicData): void {
    const dispatch = useDispatch();
    useEffect(() => {
      dispatch(PicsSlice.fetchPic(data));
    }, [dispatch, data]);
  }
  ```

  Here's what the boilerplate-ridden code looks like when using the React hook:

  ```typescript
  function ProfilePic(): ReactElement {
    PicsSlice.useFetchPic({ id: Storage.readUserId()!, type: 'PROFILE_PIC' }));
  }
  ```

## Support

This app supports the latest version of Chrome, Firefox, Safari, and Edge on desktop.

## Omni Chat API

- Never use the `@neelkamath/omni-chat` NPM package directly. Always use it through its wrapper ([`src/api/`](src/api)) or the state manager ([`src/store/`](src/store)).
- When the user is signed in, the access token can be assumed to be valid because it's automatically refreshed periodically in the background. This means that if an API call results in an unauthorized error, either the user deleted their account, or an edge case which couldn't be handled occurred (e.g., the access token was deleted from `localStorage` because the browser's history was deleted). In such cases, the user must be logged out using [`logOut.ts`](src/logOut.ts).
