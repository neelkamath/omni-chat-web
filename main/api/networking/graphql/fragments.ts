/**
 * Indicates that the GraphQL subscription has been created. This will only be sent only once, and will be the first
 * event sent.
 */
export const CREATED_SUBSCRIPTION_FRAGMENT = `
    ... on CreatedSubscription {
        __typename
        placeholder
    }
`;

export const NEW_CONTACT_FRAGMENT = `
    ... on NewContact {
        __typename
        id
        username
        emailAddress
        firstName
        lastName
        bio
    }
`;

/** `null` fields correspond to the field not existing. */
export const UPDATED_ACCOUNT_FRAGMENT = `
    ... on UpdatedAccount {
        __typename
        userId
        username
        emailAddress
        firstName
        lastName
        bio
    }
`;

/**
 * The `id` of the contact which has been deleted for the user. This happens when the user deletes a contact, or the
 * contact's account gets deleted.
 */
export const DELETED_CONTACT_FRAGMENT = `
    ... on DeletedContact {
        __typename
        id
    }
`;

/** A blocked user. */
export const BLOCKED_ACCOUNT_FRAGMENT = `
    ... on BlockedAccount {
        __typename
        id
        username
        emailAddress
        firstName
        lastName
        bio
    }
`;

/** The `id` of an unblocked user. */
export const UNBLOCKED_ACCOUNT_FRAGMENT = `
    ... on UnblockedAccount {
        __typename
        id
    }
`;

export const TOKEN_SET_FRAGMENT = `
    ... on TokenSet {
        __typename
        accessToken
        refreshToken
    }
`;

export const ACCOUNT_FRAGMENT = `
    ... on Account {
        __typename
        id
        username
        emailAddress
        firstName
        lastName
        bio
    }
`;

export const ACCOUNT_EDGE_FRAGMENT = `
    ... on AccountEdge {
        __typename
        node {
            ${ACCOUNT_FRAGMENT}
        }
        cursor
    }
`;

export const PAGE_INFO_FRAGMENT = `
    ... on PageInfo {
        __typename
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
    }
`;

export const ACCOUNTS_CONNECTION_FRAGMENT = `
    ... on AccountsConnection {
        __typename
        edges {
            ${ACCOUNT_EDGE_FRAGMENT}
        }
        pageInfo {
            ${PAGE_INFO_FRAGMENT}
        }
    }
`;
