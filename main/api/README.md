# API

- Don't document [GraphQL fragments](networking/graphql/fragments.ts);
  only [GraphQL models](networking/graphql/models.ts).
- Functions dealing with GraphQL operations which take a JWT must have the token as the first parameter regardless of
  whether it's optional.
- Functions in [`networking/`](networking) (e.g., `createAccount`, `getProfilePic`) perform the low-level API calls, and
  must never be used directly. Instead, use the equivalent functions from [`wrappers/`](wrappers) (
  e.g., `createAccount`, `getProfilePic`) which integrate with the UI. The functions in both directories must have the
  same signature with the following exceptions:
  - Wrapper functions must always read access and refresh tokens from `localStorage` instead of having them passed as
    arguments.
  - Functions in the [`wrappers/subscriptionsApi.ts`](wrappers/subscriptionsApi.ts) must not have an argument
    for `OnSocketError` be passed because they must handle it themselves.

## [GraphQL Models](networking/graphql/models.ts)

- Here's how to convert GraphQL syntax to TypeScript syntax:

  |GraphQL|TypeScript|
            |---|---|
  |`type`, `input`, `interface`|`interface`|
  |`union`, `enum`, `scalar`|`type`|
  |`implements`|`extends`|
- Models must have each of their fields defined when written as a TypeScript `interface` because it makes it easier to
  compare to the GraphQL schema models. For example, even though the `NewContact` `interface` can omit the fields
  it's `extend`ing from `AccountData`, it defines them since that's how it appears in the GraphQL schema:
    ```typescript
    export interface AccountData {
        readonly __typename: 'Account' | 'BlockedAccount' | 'NewContact';
        readonly id: number;
        readonly username: Username;
        readonly emailAddress: string;
        readonly firstName: Name;
        readonly lastName: Name;
        readonly bio: Bio;
    }
    
    export interface NewContact extends AccountData {
        readonly __typename: 'NewContact';
        readonly id: number;
        readonly username: Username;
        readonly emailAddress: string;
        readonly firstName: Name;
        readonly lastName: Name;
        readonly bio: Bio;
    }
    ```
