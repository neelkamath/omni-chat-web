/** An {@link UpdatedAccount} might be sent if the account's profile pic was updated. */
export type AccountsSubscription = CreatedSubscription | NewContact | UpdatedAccount | DeletedContact

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

/** A username must contain whitespace, must be lowercase, and must be 1-30 characters long. */
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

export type Uuid = string;

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

export interface NewContact extends AccountData {
    readonly id: number;
    readonly username: Username;
    readonly emailAddress: string;
    readonly firstName: Name;
    readonly lastName: Name;
    readonly bio: Bio;
}

/**
 * Indicates that the GraphQL subscription has been created. This will only be sent only once, and will be the first
 * event sent.
 */
export interface CreatedSubscription {
    readonly placeholder: Placeholder;
}

export interface MessageContext {
    /** Whether this message was in reply to a particular message. */
    readonly hasContext: boolean;
    /**
     * The ID of the context message.
     *
     * If this message doesn't {@link hasContext}, this will be `null`. If this message {@link hasContext}, this will be
     * `null` only if the context message was deleted. Since this message might not make any sense without the context,
     * if this message {@link hasContext}, but the context message was deleted, a frontend could replace what should've
     * been the context message with something similar to "Message deleted".
     */
    readonly id?: number;
}

export interface BareChatMessage extends BareMessage {
    readonly chatId: number;
    readonly messageId: number;
    readonly sender: Account;
    readonly dateTimes: MessageDateTimes;
    readonly context: MessageContext;
    readonly isForwarded: boolean;
}

export interface BareMessage {
    readonly messageId: number;
    readonly sender: Account;
    readonly dateTimes: MessageDateTimes;
    readonly context: MessageContext;
    readonly isForwarded: boolean;
}

export interface NewMessage extends BareChatMessage, BareMessage {
    readonly chatId: number;
    readonly messageId: number;
    readonly sender: Account;
    readonly dateTimes: MessageDateTimes;
    readonly context: MessageContext;
    readonly isForwarded: boolean;
}

export interface MessageDateTimes {
    readonly sent: DateTime;
    readonly statuses: MessageDateTimeStatus[];
}

/** The {@link dateTime} the {@link user} created the {@link status}. */
export interface MessageDateTimeStatus {
    readonly user: Account;
    readonly dateTime: DateTime;
    readonly status: MessageStatus;
}

export enum MessageStatus {DELIVERED, READ}

export interface Account extends AccountData {
    readonly id: number;
    readonly username: Username;
    readonly emailAddress: string;
    readonly firstName: Name;
    readonly lastName: Name;
    readonly bio: Bio;
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

/**
 * The {@link id} of the contact which has been deleted for the user. This happens when the user deletes a contact, or the
 * contact's account gets deleted.
 */
export interface DeletedContact {
    readonly id: number;
}
