/**
 * When the account's profile pic gets updated, an {@link UpdatedAccount} will be sent.
 *
 * A user will be automatically unblocked when they delete their account. In this scenario, an {@link UnblockedAccount}
 * will not be sent because it's a rare event, and the client would've had to deal with the user viewing a user who's
 * account was just deleted.
 */
export type AccountsSubscription =
    | CreatedSubscription
    | NewContact
    | UpdatedAccount
    | DeletedContact
    | BlockedAccount
    | UnblockedAccount;

/**
 * GraphQL mandates data be returned for every operation, and data be present in every type. However, certain operations
 * and types don't have relevant data. This type, which is an empty string, indicates such.
 */
export type Placeholder = string;

/** A unique identifier which isn't intended to be human-readable. */
export type ID = string;

/** Complies with ISO 8601. */
export type DateTime = string;

/** A cursor for pagination. */
export type Cursor = string;

/** A username must not contain whitespace, must be lowercase, and must be 1-30 characters long. */
export type Username = string;

/** A name must neither contain whitespace nor exceed 30 characters. */
export type Name = string;

/** A user's bio which cannot exceed 2,500 characters, and uses CommonMark. */
export type Bio = string;

/** A password which contains non-whitespace characters.*/
export type Password = string;

/** 1-70 characters, of which at least one isn't whitespace. */
export type GroupChatTitle = string;

/** At most 1,000 characters, and uses CommonMark. An empty string corresponds to no description. */
export type GroupChatDescription = string;

/** 1-10,000 characters, of which at least one isn't whitespace. Uses CommonMark. */
export type MessageText = string;

/**
 * Indicates that the GraphQL subscription has been created. This will only be sent only once, and will be the first
 * event sent.
 */
export interface CreatedSubscription {
    readonly placeholder: Placeholder;
}

/** Only non-null fields will be updated. */
export interface AccountUpdate {
    readonly username?: Username;
    readonly password?: Password;
    readonly emailAddress?: string;
    readonly firstName?: Name;
    readonly lastName?: Name;
    readonly bio?: Bio;
}

export interface AccountInput {
    readonly username: Username;
    readonly password: Password;
    readonly emailAddress: string;
    readonly firstName?: Name;
    readonly lastName?: Name;
    readonly bio?: Bio;
}

export interface Login {
    readonly username: Username;
    readonly password: Password;
}

export interface TokenSet {
    readonly accessToken: ID;
    readonly refreshToken: ID;
}

export interface Account extends AccountData {
    readonly id: number;
    readonly username: Username;
    readonly emailAddress: string;
    readonly firstName: Name;
    readonly lastName: Name;
    readonly bio: Bio;
}

export interface AccountsConnection {
    readonly edges: AccountEdge[];
    readonly pageInfo: PageInfo;
}

export interface AccountEdge {
    readonly node: Account;
    readonly cursor: Cursor;
}

export interface PageInfo {
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
    readonly startCursor?: Cursor;
    readonly endCursor?: Cursor;
}

export interface AccountData {
    readonly id: number;
    readonly username: Username;
    readonly emailAddress: string;
    readonly firstName: Name;
    readonly lastName: Name;
    readonly bio: Bio;
}

/** `null` fields correspond to the field not existing. */
export interface UpdatedAccount {
    readonly userId: number;
    readonly username: Username;
    readonly emailAddress: string;
    readonly firstName: Name;
    readonly lastName: Name;
    readonly bio: Bio;
}

export interface NewContact extends AccountData {
    readonly id: number;
    readonly username: Username;
    readonly emailAddress: string;
    readonly firstName: Name;
    readonly lastName: Name;
    readonly bio: Bio;
}

/**
 * The {@link id} of the contact which has been deleted for the user. This happens when the user deletes a contact, or
 * the contact's account gets deleted.
 */
export interface DeletedContact {
    readonly id: number;
}

/** The user blocked the {@link userId}. */
export interface BlockedAccount {
    readonly id: number;
    readonly username: Username;
    readonly emailAddress: string;
    readonly firstName: Name;
    readonly lastName: Name;
    readonly bio: Bio;
}

/** The user unblocked the {@link userId}. */
export interface UnblockedAccount {
    readonly id: number;
}
