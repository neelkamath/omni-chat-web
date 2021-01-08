import {AccountInput, Login, TokenSet} from './models';
import {
    CONNECTION_ERROR,
    EMAIL_ADDRESS_TAKEN_ERROR,
    EMAIL_ADDRESS_VERIFIED_ERROR,
    INCORRECT_PASSWORD_ERROR,
    INVALID_DOMAIN_ERROR,
    NONEXISTENT_USER_ERROR,
    UNREGISTERED_EMAIL_ADDRESS_ERROR,
    UNVERIFIED_EMAIL_ADDRESS_ERROR,
    USERNAME_TAKEN_ERROR
} from './errors';

interface GraphQlRequest {
    readonly query: string;
    readonly variables: object;
}

interface GraphQlResponse {
    readonly data?: GraphQlData;
    readonly errors?: GraphQlError[];
}

interface GraphQlData {
    readonly [key: string]: any;
}

interface GraphQlError {
    readonly message: string;

    readonly [key: string]: any;
}

/**
 * Executes a GraphQL query or mutation.
 *
 * @param request
 * @throws CONNECTION_ERROR
 */
async function queryOrMutate(request: GraphQlRequest): Promise<GraphQlResponse> {
    const response = await fetch(`${process.env.API_URL}/query-or-mutation`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(request),
    });
    if (response.status !== 200) throw CONNECTION_ERROR;
    return await response.json();
}

/**
 * Creates an account, and sends the user a verification email. The user will not be allowed to log in until they verify
 * their email address.
 *
 * @param account
 * @throws CONNECTION_ERROR
 * @throws USERNAME_TAKEN_ERROR
 * @throws EMAIL_ADDRESS_TAKEN_ERROR
 * @throws INVALID_DOMAIN_ERROR
 */
export async function createAccount(account: AccountInput): Promise<void> {
    const response = await queryOrMutate({
        query: `
            mutation CreateAccount($account: AccountInput!) {
                createAccount(account: $account)
            }
        `,
        variables: {account},
    });
    if ('errors' in response)
        switch (response.errors![0]!.message) {
            case 'USERNAME_TAKEN':
                throw USERNAME_TAKEN_ERROR;
            case 'EMAIL_ADDRESS_TAKEN':
                throw EMAIL_ADDRESS_TAKEN_ERROR;
            case 'INVALID_DOMAIN':
                throw INVALID_DOMAIN_ERROR;
            default:
                throw CONNECTION_ERROR;
        }
}

/**
 * When a user creates an account, or updates their email address, they'll receive an email with a verification code
 * to verify their email address. If the verification code is valid, the account's email address verification status
 * will be set to verified.
 *
 * @returns {boolean} If the verification code was valid, <true> will be returned since the account was verified.
 * Otherwise, <false> will be returned.
 * @throws CONNECTION_ERROR
 * @throws UNREGISTERED_EMAIL_ADDRESS_ERROR
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
    if ('errors' in response)
        if (response.errors![0]!.message === 'UNREGISTERED_EMAIL_ADDRESS') throw UNREGISTERED_EMAIL_ADDRESS_ERROR;
        else throw CONNECTION_ERROR;
    return response.data!['verifyEmailAddress'];
}

/**
 * Sends the user an email to verify their email address. An example use case for this operation is when the user
 * created an account (which caused an email address verification email to be sent) but accidentally deleted the email,
 * and therefore requires it to be resent.
 *
 * @param emailAddress
 * @throws CONNECTION_ERROR
 * @throws UNREGISTERED_EMAIL_ADDRESS_ERROR
 * @throws EMAIL_ADDRESS_VERIFIED_ERROR
 */
export async function emailEmailAddressVerification(emailAddress: string): Promise<void> {
    const response = await queryOrMutate({
        query: `
            mutation EmailEmailAddressVerification($emailAddress: String!) {
                emailEmailAddressVerification(emailAddress: $emailAddress)
            }
        `,
        variables: {emailAddress},
    });
    if ('errors' in response)
        switch (response.errors![0]!.message) {
            case 'UNREGISTERED_EMAIL_ADDRESS':
                throw UNREGISTERED_EMAIL_ADDRESS_ERROR;
            case 'EMAIL_ADDRESS_VERIFIED':
                throw EMAIL_ADDRESS_VERIFIED_ERROR;
            default:
                throw CONNECTION_ERROR;
        }
}

/**
 * @param login
 * @throws CONNECTION_ERROR
 * @throws NONEXISTENT_USER_ERROR
 * @throws UNVERIFIED_EMAIL_ADDRESS_ERROR
 * @throws INCORRECT_PASSWORD_ERROR
 */
export async function requestTokenSet(login: Login): Promise<TokenSet> {
    const response = await queryOrMutate({
        query: `
            query RequestTokenSet($login: Login!) {
                requestTokenSet(login: $login) {
                    accessToken
                    refreshToken
                }
            }
        `,
        variables: {login},
    });
    if ('errors' in response) {
        switch (response.errors![0]!.message) {
            case 'NONEXISTENT_USER':
                throw NONEXISTENT_USER_ERROR;
            case 'UNVERIFIED_EMAIL_ADDRESS':
                throw UNVERIFIED_EMAIL_ADDRESS_ERROR;
            case 'INCORRECT_PASSWORD':
                throw INCORRECT_PASSWORD_ERROR;
            default:
                throw CONNECTION_ERROR;
        }
    }
    return response.data!['requestTokenSet'];
}

/**
 * Used when the user wants to reset their password because they forgot it. Sends a password reset email to the supplied
 * email address.
 *
 * @param emailAddress
 * @throws CONNECTION_ERROR
 * @throws UNREGISTERED_EMAIL_ADDRESS_ERROR
 * @see resetPassword Use this other operation once
 * @see updateAccount Use this if the user is logged in (i.e., you have an access token), and wants to update their
 * password.
 */
export async function emailPasswordResetCode(emailAddress: string): Promise<void> {
    const response = await queryOrMutate({
        query: `
            mutation EmailPasswordResetCode($emailAddress: String!) {
                emailPasswordResetCode(emailAddress: $emailAddress)
            }
        `,
        variables: {emailAddress},
    });
    if ('errors' in response)
        if (response.errors![0]!.message === 'UNREGISTERED_EMAIL_ADDRESS') throw UNREGISTERED_EMAIL_ADDRESS_ERROR;
        else throw CONNECTION_ERROR;
}

/**
 * @param emailAddress
 * @param passwordResetCode
 * @param newPassword
 * @returns If the password reset code was correct, the password has been reset, and <true> will be returned. Otherwise,
 * <false> will be returned.
 * @throws CONNECTION_ERROR
 * @throws UNREGISTERED_EMAIL_ADDRESS_ERROR
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
    if ('errors' in response)
        if (response.errors![0]!.message === 'UNREGISTERED_EMAIL_ADDRESS') throw UNREGISTERED_EMAIL_ADDRESS_ERROR;
        else throw CONNECTION_ERROR;
    return response.data!['resetPassword'];
}
