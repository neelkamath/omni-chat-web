/**
 * An {@link UpdatedAccount} might be sent if the account's profile pic was updated.
 */
export type AccountsSubscription = CreatedSubscription | NewContact | UpdatedAccount | DeletedContact

export interface AccountInput {
    readonly username: string;
    readonly password: string;
    readonly emailAddress: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly bio?: string;
}

export interface Login {
    readonly username: string;
    readonly password: string;
}

export interface TokenSet {
    readonly accessToken: string;
    readonly refreshToken: string;
}

export interface NewContact extends AccountData {
    readonly id: number;
    readonly username: string;
    readonly emailAddress: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly bio: string;
}

/**
 * Indicates that the GraphQL subscription has been created. This will only be sent only once, and will be the first
 * event sent.
 */
export interface CreatedSubscription {
    readonly placeholder: string;
}

export interface MessageContext {
    /**
     * Whether this message was in reply to a particular message.
     */
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
    readonly sent: string;
    readonly statuses: MessageDateTimeStatus[];
}

/**
 * The {@link dateTime} the {@link user} created the {@link status}.
 */
export interface MessageDateTimeStatus {
    readonly user: Account;
    readonly dateTime: string;
    readonly status: MessageStatus;
}

export enum MessageStatus {DELIVERED, READ}

export interface Account extends AccountData {
    readonly id: number;
    readonly username: string;
    readonly emailAddress: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly bio: string;
}

export interface AccountData {
    readonly id: number;
    readonly username: string;
    readonly emailAddress: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly bio: string;
}

/**
 * `null` fields correspond to the field not existing.
 */
export interface UpdatedAccount {
    readonly userId: number;
    readonly username: string;
    readonly emailAddress: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly bio: string;
}

/**
 * The {@link id} of the contact which has been deleted for the user. This happens when the user deletes a contact, or the
 * contact's account gets deleted.
 */
export interface DeletedContact {
    readonly id: number;
}
