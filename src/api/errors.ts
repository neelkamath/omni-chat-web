import {message} from 'antd';

/**
 * This error is thrown when the server is unreachable. For example, the server may have crashed due to a server-side
 * bug, the client sent the server a malformed request, or the client's internet connection is down.
 */
export const CONNECTION_ERROR = 'CONNECTION_ERROR';

export async function displayConnectionError(): Promise<void> {
    message.error('The server is currently unreachable.');
}

/**
 * The Omni Chat instance being used disallows the given email address's domain. For example,
 * `"john.doe@private.company.com"` may be allowed but not `"john.doe@gmail.com"`.
 */
export const INVALID_DOMAIN_ERROR = 'INVALID_DOMAIN_ERROR';

export async function displayInvalidDomainError(): Promise<void> {
    message.error(
        "The administrator has disallowed the email address's domain you've used. For example, if the administrator " +
        "has only allowed Gmail accounts, you'll be unable to sign up with an Outlook account.",
        10,
    );
}

/**
 * The email address isn't registered with an account.
 */
export const UNREGISTERED_EMAIL_ADDRESS_ERROR = 'UNREGISTERED_EMAIL_ADDRESS_ERROR';

export async function displayUnregisteredEmailAddressError(): Promise<void> {
    message.error("That email address isn't associated with an account.");
}

export const USERNAME_TAKEN_ERROR = 'USERNAME_TAKEN_ERROR';

export async function displayUsernameTakenError(): Promise<void> {
    message.error('That username is taken. Try another.');
}

export const EMAIL_ADDRESS_TAKEN_ERROR = 'EMAIL_ADDRESS_TAKEN_ERROR';

export async function displayEmailAddressTakenError(): Promise<void> {
    message.error('That email address is taken. Try another.');
}

export const EMAIL_ADDRESS_VERIFIED_ERROR = 'EMAIL_ADDRESS_VERIFIED_ERROR';

export async function displayEmailAddressVerifiedError(): Promise<void> {
    message.error('This email address has already been verified.');
}

/**
 * No such username.
 */
export const NONEXISTENT_USER_ERROR = 'NONEXISTENT_USER_ERROR';

export async function displayNonExistentUserError(): Promise<void> {
    message.error("That username couldn't be found.");
}

export const UNVERIFIED_EMAIL_ADDRESS_ERROR = 'UNVERIFIED_EMAIL_ADDRESS';

export async function displayUnverifiedEmailAddressError(): Promise<void> {
    message.error('You must first verify your email address.');
}

export const INCORRECT_PASSWORD_ERROR = 'INCORRECT_PASSWORD_ERROR';

export async function displayIncorrectPasswordError(): Promise<void> {
    message.error('Incorrect password.');
}
