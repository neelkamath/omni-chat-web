/**
 * GraphQL scalar value errors must be named using the format `<SCALAR>ScalarError`. For example, the class name for an
 * invalid scalar named `Username` must be `UsernameScalarError`.
 *
 * Other GraphQL errors must be named using the format `<ERROR>Error`. For example, the class name for the error message
 * `'NONEXISTENT_USER_ID'` must be `NonexistentUserIdError`.
 *
 * REST API errors may reuse GraphQL error types if they provide to be a good fit.
 */

import React from 'react';
import {message, notification, Typography} from 'antd';

export class NonexistentUserIdError extends Error {
    static async display(): Promise<void> {
        message.warning('That user just deleted their account.');
    }
}

export class NonexistentChatError extends Error {
}

/** Pic wasn't a PNG or JPEG not exceeding 25 MiB. */
export class InvalidPicError extends Error {
    static async display(): Promise<void> {
        message.error('The picture must be a PNG or JPEG file not exceeding 25 MB.');
    }
}

/** Occurs when an operation requiring an access token was either not passed a token or was passed an invalid one. */
export class UnauthorizedError extends Error {
}

/**
 * This error is thrown when the server is unreachable. For example, the server may have crashed due to a server-side
 * bug, the client sent the server a malformed request, or the client's internet connection is down.
 */
export class ConnectionError extends Error {
    static async display(): Promise<void> {
        message.error('The server is currently unreachable.');
    }
}

/** The specified user ID doesn't exist. */
export class InvalidUserIdError extends Error {
    static async display(): Promise<void> {
        message.warning('That user just deleted their account.');
    }
}

/** One of the user IDs which were trying to be saved didn't exist. */
export class InvalidContactError extends Error {
    static async display(): Promise<void> {
        message.warning('That user just deleted their account.');
    }
}

export class InvalidChatIdError extends Error {
    static async display(): Promise<void> {
        message.warning('The user the private chat was to be had with just deleted their account.');
    }
}

/** Either the frontend sent a malformed request or the backend has a bug. */
export class InternalServerError extends Error {
    static display(): void {
        notification.error({
            message: 'Something Went Wrong',
            description:
                <Typography.Text>
                    Please report this bug to <Typography.Link>neelkamathonline@gmail.com</Typography.Link>.
                </Typography.Text>,
        });
    }
}

/**
 * The user's account cannot be deleted because the user is the only admin of a group chat containing users other than
 * themselves. They must appoint a different user as the admin in order to be able to delete their account.
 */
export class CannotDeleteAccountError extends Error {
    static async display(): Promise<void> {
        message.error(
            "You are the only admin of a group chat containing users other than yourself. You'll need to first appoint "
            + 'a different user as the admin in order to be able to delete your account.',
            10,
        );
    }
}

/**
 * The Omni Chat instance being used disallows the given email address's domain. For example,
 * `"john.doe@private.company.com"` may be allowed but not `"john.doe@gmail.com"`.
 */
export class InvalidDomainError extends Error {
    static async display(): Promise<void> {
        message.error(
            "The administrator has disallowed the email address's domain you've used. For example, if the " +
            "administrator has only allowed Gmail accounts, you'll be unable to sign up with an Outlook account.",
            10,
        );
    }
}

/** The email address isn't registered with an account. */
export class UnregisteredEmailAddressError extends Error {
    static async display(): Promise<void> {
        message.error("That email address isn't associated with an account.");
    }
}

export class UsernameTakenError extends Error {
    static async display(): Promise<void> {
        message.error('That username is taken. Try another.');
    }
}

export class EmailAddressTakenError extends Error {
    static async display(): Promise<void> {
        message.error('That email address is taken. Try another.');
    }
}

export class EmailAddressVerifiedError extends Error {
    static async display(): Promise<void> {
        message.error('This email address has already been verified.');
    }
}

/** No such username. */
export class NonexistentUserError extends Error {
    static async display(): Promise<void> {
        message.error("That username couldn't be found.");
    }
}

export class UnverifiedEmailAddressError extends Error {
    static async display(): Promise<void> {
        message.error('You must first verify your email address.');
    }
}

export class IncorrectPasswordError extends Error {
    static async display(): Promise<void> {
        message.error('Incorrect password.');
    }
}

/**
 * Invalid {@link DateTime}.
 * @see validateDateTimeScalar
 */
export class DateTimeScalarError extends Error {
}

/**
 * Invalid {@link Username}.
 * @see validateUsernameScalar
 */
export class UsernameScalarError extends Error {
    static async display(): Promise<void> {
        message.error(
            'A username must not contain whitespace, must be lowercase, and must be 1-30 characters long.',
            10,
        );
    }
}

/**
 * Invalid {@link Name}.
 * @see validateNameScalar
 */
export class NameScalarError extends Error {
    static async display(): Promise<void> {
        message.error('A name must neither contain whitespace nor exceed 30 characters.', 5);
    }
}

/**
 * Invalid {@link Bio}.
 * @see validateBioScalar
 */
export class BioScalarError extends Error {
    static async display(): Promise<void> {
        message.error('A bio cannot exceed 2,500 characters.');
    }
}

/**
 * Invalid {@link Password}.
 * @see validatePasswordScalar
 */
export class PasswordScalarError extends Error {
    static async display(): Promise<void> {
        message.error('A password must contain non-whitespace characters.', 5);
    }
}

/**
 * Invalid {@link GroupChatTitle}.
 * @see validateGroupChatTitleScalar
 */
export class GroupChatTitleScalarError extends Error {
}

/**
 * Invalid {@link GroupChatDescription}.
 * @see validateGroupChatDescriptionScalar
 */
export class GroupChatDescriptionScalarError extends Error {
}

/**
 * Invalid {@link MessageText}.
 * @see validateMessageTextScalar
 */
export class MessageTextScalarError extends Error {
}
