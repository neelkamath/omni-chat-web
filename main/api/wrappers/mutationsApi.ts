import {AccountInput, AccountUpdate} from '../networking/graphql/models';
import * as mutationsApi from '../networking/graphql/mutationsApi';
import * as storage from '../../storage';
import * as queriesApi from '../networking/graphql/queriesApi';
import {
    BioScalarError,
    CannotDeleteAccountError,
    ConnectionError,
    EmailAddressTakenError,
    EmailAddressVerifiedError,
    InternalServerError,
    InvalidContactError,
    InvalidDomainError,
    NameScalarError,
    PasswordScalarError,
    UnauthorizedError,
    UnregisteredEmailAddressError,
    UsernameScalarError,
    UsernameTakenError
} from '../networking/errors';
import {message} from 'antd';
import {logOut} from '../../logOut';

export async function createAccount(account: AccountInput): Promise<void> {
    try {
        await mutationsApi.createAccount(account);
    } catch (error) {
        if (error instanceof UsernameScalarError) await UsernameScalarError.display();
        else if (error instanceof PasswordScalarError) await PasswordScalarError.display();
        else if (error instanceof NameScalarError) await NameScalarError.display();
        else if (error instanceof BioScalarError) await BioScalarError.display();
        else if (error instanceof InvalidDomainError) await InvalidDomainError.display();
        else if (error instanceof UsernameTakenError) await UsernameTakenError.display();
        else if (error instanceof EmailAddressTakenError) await EmailAddressTakenError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    message.success('Account created. Check your email for an account verification code.', 5);
}

export async function verifyEmailAddress(emailAddress: string, verificationCode: number): Promise<void> {
    let isVerified;
    try {
        isVerified = await mutationsApi.verifyEmailAddress(emailAddress, verificationCode);
    } catch (error) {
        if (error instanceof UnregisteredEmailAddressError) await UnregisteredEmailAddressError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    isVerified ? message.success('Email address verified.') : message.error('Incorrect verification code.');
}

export async function emailEmailAddressVerification(emailAddress: string): Promise<void> {
    try {
        await mutationsApi.emailEmailAddressVerification(emailAddress);
    } catch (error) {
        if (error instanceof UnregisteredEmailAddressError) await UnregisteredEmailAddressError.display();
        else if (error instanceof EmailAddressVerifiedError) await EmailAddressVerifiedError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    message.success('Resent verification code.');
}

export async function emailPasswordResetCode(emailAddress: string): Promise<void> {
    try {
        await mutationsApi.emailPasswordResetCode(emailAddress);
    } catch (error) {
        if (error instanceof UnregisteredEmailAddressError) await UnregisteredEmailAddressError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    message.success('Password reset code sent to your email.');
}

export async function updateAccount(update: AccountUpdate): Promise<void> {
    const accessToken = storage.readTokenSet()!.accessToken;
    let oldAccount;
    try {
        oldAccount = await queriesApi.readAccount(accessToken);
        await mutationsApi.updateAccount(accessToken, update);
    } catch (error) {
        if (error instanceof UsernameScalarError) await UsernameScalarError.display();
        else if (error instanceof PasswordScalarError) await PasswordScalarError.display();
        else if (error instanceof NameScalarError) await NameScalarError.display();
        else if (error instanceof BioScalarError) await BioScalarError.display();
        else if (error instanceof UnauthorizedError) logOut();
        else if (error instanceof UsernameTakenError) await UsernameTakenError.display();
        else if (error instanceof EmailAddressTakenError) await EmailAddressTakenError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    message.success('Account updated.');
    if (update.emailAddress !== undefined && oldAccount.emailAddress !== update.emailAddress) logOut();
}

export async function resetPassword(
    emailAddress: string,
    passwordResetCode: number,
    newPassword: string,
): Promise<void> {
    let isReset;
    try {
        isReset = await mutationsApi.resetPassword(emailAddress, passwordResetCode, newPassword);
    } catch (error) {
        if (error instanceof UnregisteredEmailAddressError) await UnregisteredEmailAddressError.display();
        else if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    if (isReset) message.success('Password reset.');
    else message.error('Incorrect password reset code.');
}

export async function deleteProfilePic(): Promise<void> {
    try {
        await mutationsApi.deleteProfilePic(storage.readTokenSet()!.accessToken);
    } catch (error) {
        if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) logOut();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else throw error;
        return;
    }
    message.success('Profile picture deleted.');
}

export async function deleteAccount(): Promise<void> {
    try {
        await mutationsApi.deleteAccount(storage.readTokenSet()!.accessToken);
    } catch (error) {
        if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) logOut();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        else if (error instanceof CannotDeleteAccountError) await CannotDeleteAccountError.display();
        else throw error;
        return;
    }
    logOut();
}

export async function createContacts(userIdList: number[]): Promise<void> {
    try {
        await mutationsApi.createContacts(storage.readTokenSet()!.accessToken, userIdList);
    } catch (error) {
        if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) logOut();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        // An <InvalidContactError> will be thrown if the user who was to be added just deleted their account.
        else if (!(error instanceof InvalidContactError)) throw error;
        return;
    }
    message.success('Contacts created.');
}

export async function deleteContacts(userIdList: number[]): Promise<void> {
    try {
        await mutationsApi.deleteContacts(storage.readTokenSet()!.accessToken, userIdList);
    } catch (error) {
        if (error instanceof InternalServerError) InternalServerError.display();
        else if (error instanceof UnauthorizedError) logOut();
        else if (error instanceof ConnectionError) await ConnectionError.display();
        return;
    }
    message.success('Contacts deleted.');
}
