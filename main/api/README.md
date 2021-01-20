# API

Functions in [`networking/`](main/api/networking) (e.g., `createAccount`, `getProfilePic`) perform the low-level API
calls, and must never be used directly. Instead, use the equivalent functions from [`wrappers/`](main/api/wrappers) (
e.g., `createAccount`, `getProfilePic`) which integrate with the UI. The functions in both directories must have the
same signature with the following exceptions:

- Wrapper functions must always read access and refresh tokens from `localStorage` instead of having them passed as
  function arguments.
- Functions in the [`wrappers/subscriptionsApi.ts`](main/api/wrappers/subscriptionsApi.ts) must not have an argument
  for `OnSocketError` be passed because they must handle it themselves. 
