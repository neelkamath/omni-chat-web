import {AccountInput, AccountUpdate, Placeholder} from './models';
import {queryOrMutate} from './operator';
import {
    CannotDeleteAccountError,
    ConnectionError,
    EmailAddressTakenError,
    EmailAddressVerifiedError,
    InternalServerError,
    InvalidContactError,
    InvalidDomainError,
    InvalidUserIdError,
    UnregisteredEmailAddressError,
    UsernameTakenError,
} from '../errors';
import {validateAccountInput, validateAccountUpdate} from './validators';

/**
 * Creates an account, and sends the user a verification email. The user will not be allowed to log in until they verify
 * their email address.
 * @throws {ConnectionError}
 * @throws {UsernameTakenError}
 * @throws {EmailAddressTakenError}
 * @throws {InvalidDomainError}
 * @throws {InternalServerError}
 * @throws {UsernameScalarError}
 * @throws {PasswordScalarError}
 * @throws {NameScalarError}
 * @throws {BioScalarError}
 * @throws {UnauthorizedError}
 */
export async function createAccount(account: AccountInput): Promise<Placeholder> {
    validateAccountInput(account);
    const response = await queryOrMutate({
        query: `
            mutation CreateAccount($account: AccountInput!) {
                createAccount(account: $account)
            }
        `,
        variables: {account},
    });
    if (response.errors !== undefined)
        switch (response.errors[0]!.message) {
            case 'USERNAME_TAKEN':
                throw new UsernameTakenError();
            case 'EMAIL_ADDRESS_TAKEN':
                throw new EmailAddressTakenError();
            case 'INVALID_DOMAIN':
                throw new InvalidDomainError();
            case 'INTERNAL_SERVER_ERROR':
                throw new InternalServerError();
            default:
                throw new ConnectionError();
        }
    return response.data!.createAccount;
}

/**
 * When a user creates an account, or updates their email address, they'll receive an email with a verification code to
 * verify their email address. If the verification code is valid, the account's email address verification status will
 * be set to verified.
 * @returns {boolean} If the verification code was valid, <true> will be returned since the account was verified.
 * Otherwise, <false> will be returned.
 * @throws {ConnectionError}
 * @throws {UnregisteredEmailAddressError}
 * @throws {InternalServerError}
 * @throws {UnauthorizedError}
 */
export async function verifyEmailAddress(emailAddress: string, verificationCode: number): Promise<boolean> {
    const response = await queryOrMutate({
        query: `
            mutation VerifyEmailAddress($emailAddress: String!, $verificationCode: Int!) {
                verifyEmailAddress(emailAddress: $emailAddress, verificationCode: $verificationCode)
            }
        `,
        variables: {emailAddress, verificationCode},
    });
    if (response.errors !== undefined)
        switch (response.errors![0]!.message) {
            case 'UNREGISTERED_EMAIL_ADDRESS':
                throw new UnregisteredEmailAddressError();
            case 'INTERNAL_SERVER_ERROR':
                throw new InternalServerError();
            default:
                throw new ConnectionError();
        }
    return response.data!.verifyEmailAddress;
}

/**
 * Sends the user an email to verify their email address. An example use case for this operation is when the user
 * created an account (which caused an email address verification email to be sent) but accidentally deleted the email,
 * and therefore requires it to be resent.
 * @throws {ConnectionError}
 * @throws {UnregisteredEmailAddressError}
 * @throws {EmailAddressVerifiedError}
 * @throws {InternalServerError}
 * @throws {UnauthorizedError}
 */
export async function emailEmailAddressVerification(emailAddress: string): Promise<Placeholder> {
    const response = await queryOrMutate({
        query: `
            mutation EmailEmailAddressVerification($emailAddress: String!) {
                emailEmailAddressVerification(emailAddress: $emailAddress)
            }
        `,
        variables: {emailAddress},
    });
    if (response.errors !== undefined)
        switch (response.errors![0]!.message) {
            case 'UNREGISTERED_EMAIL_ADDRESS':
                throw new UnregisteredEmailAddressError();
            case 'EMAIL_ADDRESS_VERIFIED':
                throw new EmailAddressVerifiedError();
            case 'INTERNAL_SERVER_ERROR':
                throw new InternalServerError();
            default:
                throw new ConnectionError();
        }
    return response.data!.emailEmailAddressVerification;
}

/**
 * Used when the user wants to reset their password because they forgot it. Sends a password reset email to the supplied
 * email address.
 * @throws {ConnectionError}
 * @throws {UnregisteredEmailAddressError}
 * @throws {InternalServerError}
 * @throws {UnauthorizedError}
 * @see resetPassword Use this other operation once
 * @see updateAccount Use this if the user is logged in (i.e., you have an access token), and wants to update their
 * password.
 */
export async function emailPasswordResetCode(emailAddress: string): Promise<Placeholder> {
    const response = await queryOrMutate({
        query: `
            mutation EmailPasswordResetCode($emailAddress: String!) {
                emailPasswordResetCode(emailAddress: $emailAddress)
            }
        `,
        variables: {emailAddress},
    });
    if (response.errors !== undefined)
        switch (response.errors![0]!.message) {
            case 'UNREGISTERED_EMAIL_ADDRESS':
                throw new UnregisteredEmailAddressError();
            case 'INTERNAL_SERVER_ERROR':
                throw new InternalServerError();
            default:
                throw new ConnectionError();
        }
    return response.data!.emailPasswordResetCode;
}

/**
 * Updates the user's account. Only the non-`null` fields will be updated. None of the updates will take place if even
 * one of the fields were invalid. If the user updates their email address to something other than their current
 * address, you must log them out because the current access token will be invalid until they verify their new email
 * address.
 *
 * If the user updates their email address, they'll be required to verify it before their next login via an email which
 * is sent to it. This means they'll be locked out of their account if they provide an invalid address, and will have to
 * contact the service's admin to correctly update their address. You could prevent this mistake by asking them to
 * confirm their address. For example, a UI could require the user to enter their email address twice if they're
 * updating it, and only allow the update to take place if both the entered addresses match.
 * @throws {UnauthorizedError}
 * @throws {UsernameTakenError}
 * @throws {EmailAddressTakenError}
 * @throws {ConnectionError}
 * @throws {InternalServerError}
 * @throws {UsernameScalarError}
 * @throws {PasswordScalarError}
 * @throws {NameScalarError}
 * @throws {BioScalarError}
 */
export async function updateAccount(accessToken: string, update: AccountUpdate): Promise<Placeholder> {
    validateAccountUpdate(update);
    const response = await queryOrMutate({
        query: `
            mutation UpdateAccount($update: AccountUpdate!) {
                updateAccount(update: $update)
            }
        `,
        variables: {update},
    }, accessToken);
    if (response.errors !== undefined) {
        switch (response.errors[0]!.message) {
            case 'USERNAME_TAKEN':
                throw new UsernameTakenError();
            case 'EMAIL_ADDRESS_TAKEN':
                throw new EmailAddressTakenError();
            case 'INTERNAL_SERVER_ERROR':
                throw new InternalServerError();
            default:
                throw new ConnectionError();
        }
    }
    return response.data!.updateAccount;
}

/**
 * @returns If the password reset code was correct, the password has been reset, and <true> will be returned. Otherwise,
 * <false> will be returned.
 * @throws {ConnectionError}
 * @throws {UnregisteredEmailAddressError}
 * @throws {InternalServerError}
 * @throws {UnauthorizedError}
 */
export async function resetPassword(
    emailAddress: string,
    passwordResetCode: number,
    newPassword: string,
): Promise<boolean> {
    const response = await queryOrMutate({
        query: `
            mutation ResetPassword($emailAddress: String!, $passwordResetCode: Int!, $newPassword: Password!) {
                resetPassword(
                    emailAddress: $emailAddress, 
                    passwordResetCode: $passwordResetCode, 
                    newPassword: $newPassword
                )
            }
        `,
        variables: {emailAddress, passwordResetCode, newPassword},
    });
    if (response.errors !== undefined)
        switch (response.errors![0]!.message) {
            case 'UNREGISTERED_EMAIL_ADDRESS':
                throw new UnregisteredEmailAddressError();
            case 'INTERNAL_SERVER_ERROR':
                throw new InternalServerError();
            default:
                throw new ConnectionError();
        }
    return response.data!.resetPassword;
}

/**
 * Deletes the user's profile pic.
 * @throws {UnauthorizedError}
 * @throws {ConnectionError}
 * @throws {InternalServerError}
 */
export async function deleteProfilePic(accessToken: string): Promise<Placeholder> {
    const response = await queryOrMutate({
        query: `
            mutation DeleteProfilePic {
                deleteProfilePic
            }
        `,
    }, accessToken);
    if (response.errors !== undefined) {
        if (response.errors[0]!.message === 'INTERNAL_SERVER_ERROR') throw new InternalServerError();
        throw new ConnectionError();
    }
    return response.data!.deleteProfilePic;
}

/**
 * Deletes the user's account. All the user's data will be wiped from the system. This means that users in private chats
 * with the user will have their chats deleted, etc.
 * @throws {CannotDeleteAccountError}
 * @throws {InternalServerError}
 * @throws {UnauthorizedError}
 * @throws {ConnectionError}
 */
export async function deleteAccount(accessToken: string): Promise<Placeholder> {
    const response = await queryOrMutate({
        query: `
            mutation DeleteAccount {
                deleteAccount
            }
        `,
    }, accessToken);
    if (response.errors !== undefined) {
        switch (response.errors[0]!.message) {
            case 'INTERNAL_SERVER_ERROR':
                throw new InternalServerError();
            case 'CANNOT_DELETE_ACCOUNT':
                throw new CannotDeleteAccountError();
            default:
                throw new ConnectionError();
        }
    }
    return response.data!.deleteAccount;
}

/**
 * Saves contacts. Contacts previously saved will be ignored. If the user's own contact is present, it will be ignored.
 * @throws {InvalidContactError}
 * @throws {InternalServerError}
 * @throws {ConnectionError}
 * @throws {UnauthorizedError}
 */
export async function createContacts(accessToken: string, userIdList: number[]): Promise<Placeholder> {
    const response = await queryOrMutate({
        query: `
            mutation CreateContacts($userIdList: [Int!]!) {
                createContacts(userIdList: $userIdList)
            }
        `,
        variables: {userIdList},
    }, accessToken);
    if (response.errors !== undefined) {
        switch (response.errors[0]!.message) {
            case 'INTERNAL_SERVER_ERROR':
                throw new InternalServerError();
            case 'INVALID_CONTACT':
                throw new InvalidContactError();
            default:
                throw new ConnectionError();
        }
    }
    return response.data!.createContacts;
}

/**
 * Remove saved contacts. Invalid contacts (e.g., invalid user IDs, unsaved contacts) will be ignored.
 * @throws {InternalServerError}
 * @throws {ConnectionError}
 * @throws {UnauthorizedError}
 */
export async function deleteContacts(accessToken: string, userIdList: number[]): Promise<Placeholder> {
    const response = await queryOrMutate({
        query: `
            mutation DeleteContacts($userIdList: [Int!]!) {
                deleteContacts(userIdList: $userIdList)
            }
        `,
        variables: {userIdList},
    }, accessToken);
    if (response.errors !== undefined) {
        if (response.errors[0]!.message === 'INTERNAL_SERVER_ERROR') throw new InternalServerError();
        throw new ConnectionError();
    }
    return response.data!.deleteContacts;
}

/**
 * Blocks the user. Does nothing if the user has already been blocked, or the user is blocking themselves.
 * @throws {InvalidUserIdError}
 * @throws {InternalServerError}
 * @throws {ConnectionError}
 * @throws {UnauthorizedError}
 */
export async function blockUser(accessToken: string, userId: number): Promise<Placeholder> {
    const response = await queryOrMutate({
        query: `
            mutation BlockUser($userId: Int!) {
                blockUser(userId: $userId)
            }
        `,
        variables: {userId},
    }, accessToken);
    if (response.errors !== undefined) {
        switch (response.errors[0]!.message) {
            case 'INTERNAL_SERVER_ERROR':
                throw new InternalServerError();
            case 'INVALID_USER_ID':
                throw new InvalidUserIdError();
            default:
                throw new ConnectionError();
        }
    }
    return response.data!.blockUser;
}

/**
 * Unblocks the user. Does nothing if the user wasn't blocked.
 * @throws {InternalServerError}
 * @throws {ConnectionError}
 * @throws {UnauthorizedError}
 */
export async function unblockUser(accessToken: string, userId: number): Promise<Placeholder> {
    const response = await queryOrMutate({
        query: `
            mutation UnblockUser($userId: Int!) {
                unblockUser(userId: $userId)
            }
        `,
        variables: {userId},
    }, accessToken);
    if (response.errors !== undefined) {
        if (response.errors[0]!.message === 'INTERNAL_SERVER_ERROR') throw new InternalServerError();
        throw new ConnectionError();
    }
    return response.data!.unblockUser;
}
