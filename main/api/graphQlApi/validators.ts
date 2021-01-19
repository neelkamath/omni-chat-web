import {
    BioScalarError,
    DateTimeScalarError,
    GroupChatDescriptionScalarError,
    GroupChatTitleScalarError,
    MessageTextScalarError,
    NameScalarError,
    PasswordScalarError,
    UsernameScalarError
} from '../errors';
import {AccountInput, AccountUpdate, Login} from './models';

/** @throws {UsernameScalarError} if the `value` is neither `undefined` nor a valid {@link Username}. */
export function validateUsernameScalar(value?: string): void {
    if (value === undefined) return;
    if (value.match(/\s/) !== null || value.match(/[A-Z]/) !== null || value.length < 1 || value.length > 30)
        throw new UsernameScalarError();
}

/** @throws {NameScalarError} if the `value` is neither `undefined` nor a valid {@link Name}. */
export function validateNameScalar(value?: string): void {
    if (value === undefined) return;
    if (value.match(/\s/) !== null || value.length > 30) throw new NameScalarError();
}

/** @throws {BioScalarError} if the `value` is neither `undefined` nor a valie {@link Bio}. */
export function validateBioScalar(value?: string): void {
    if (value === undefined) return;
    if (value.length > 2500) throw new BioScalarError();
}

/** @throws {GroupChatTitleScalarError} if the `value` is neither `undefined` nor a valid {@link GroupChatTitle}. */
export function validateGroupChatTitleScalar(value?: string): void {
    if (value === undefined) return;
    if (value.length < 1 || value.length > 70 || value.trim().length === 0) throw new GroupChatTitleScalarError();
}

/** @throws {MessageTextScalarError} if the `value` is neither `undefined` nor a valid {@link MessageText}. */
export function validateMessageTextScalar(value?: string): void {
    if (value === undefined) return;
    if (value.length < 1 || value.length > 10_000 || value.trim().length === 0) throw new MessageTextScalarError();
}

/**
 * @throws {GroupChatDescriptionScalarError} if the `value` is neither `undefined` nor a valid
 * {@link GroupChatDescription}.
 */
export function validateGroupChatDescriptionScalar(value?: string): void {
    if (value === undefined) return;
    if (value.length > 1000) throw new GroupChatDescriptionScalarError();
}

/** @throws {DateTimeScalarError} if the `value` is neither `undefined` nor a valid {@link DateTime}. */
export function validateDateTimeScalar(value?: string): void {
    if (value === undefined) return;
    if (isNaN(Date.parse(value))) throw new DateTimeScalarError();
}

/** @throws {PasswordScalarError} if the `value` is neither `undefined` nor a value {@link Password} */
export function validatePasswordScalar(value?: string): void {
    if (value === undefined) return;
    if (value.match(/\s/) !== null) throw new PasswordScalarError();
}

/**
 * @param value Will not be validated if `undefined`.
 * @throws {UsernameScalarError}
 * @throws {PasswordScalarError}
 * @throws {NameScalarError}
 * @throws {BioScalarError}
 */
export function validateAccountInput(value?: AccountInput): void {
    if (value === undefined) return;
    validateUsernameScalar(value.username);
    validatePasswordScalar(value.password);
    validateNameScalar(value.firstName);
    validateNameScalar(value.lastName);
    validateBioScalar(value.bio);
}

/**
 * @param value Will not be validated if `undefined`.
 * @throws {UsernameScalarError}
 * @throws {PasswordScalarError}
 * @throws {NameScalarError}
 * @throws {BioScalarError}
 */
export function validateAccountUpdate(value?: AccountUpdate): void {
    if (value === undefined) return;
    validateUsernameScalar(value.username);
    validatePasswordScalar(value.password);
    validateNameScalar(value.firstName);
    validateNameScalar(value.lastName);
    validateBioScalar(value.bio);
}

/**
 * @param value Will not be validated if `undefined`.
 * @throws {UsernameScalarError}
 * @throws {PasswordScalarError}
 */
export function validateLogin(value?: Login): void {
    if (value === undefined) return;
    validateUsernameScalar(value.username);
    validatePasswordScalar(value.password);
}
