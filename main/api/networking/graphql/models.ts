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
    readonly hasNextPage: Boolean;
    readonly hasPreviousPage: Boolean;
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
