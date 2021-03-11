import logOut from '../logOut';
import {message, notification, Typography} from 'antd';
import React from 'react';
import {
  BioScalarError,
  CannotDeleteAccountError,
  ConnectionError,
  EmailAddressTakenError,
  EmailAddressVerifiedError,
  GroupChatDescriptionScalarError,
  GroupChatTitleScalarError,
  IncorrectPasswordError,
  InternalServerError,
  InvalidActionError,
  InvalidAudioError,
  InvalidChatIdError,
  InvalidDocError,
  InvalidDomainError,
  InvalidInviteCodeError,
  InvalidInvitedChatError,
  InvalidPicError,
  InvalidPollError,
  InvalidVideoError,
  MessageTextScalarError,
  NameScalarError,
  PasswordScalarError,
  UnauthorizedError,
  UnregisteredEmailAddressError,
  UnverifiedEmailAddressError,
  UsernameScalarError,
  UsernameTakenError,
} from '@neelkamath/omni-chat';

export async function handleGraphQlApiError(error: Error): Promise<void> {
  if (error instanceof UsernameTakenError)
    message.error('That username is taken. Try another.');
  else if (error instanceof EmailAddressTakenError)
    message.error('That email address is taken. Try another.');
  else if (error instanceof InvalidDomainError)
    message.error(
      "The administrator has disallowed the email address's domain you've " +
      'used. For example, if the administrator has only allowed Gmail ' +
      "accounts, you'll be unable to sign up with an Outlook account.",
      10
    );
  else if (error instanceof UnregisteredEmailAddressError)
    message.error("That email address isn't associated with an account.");
  else if (error instanceof EmailAddressVerifiedError)
    message.error('This email address has already been verified.');
  else if (error instanceof CannotDeleteAccountError)
    message.error(
      'You are the only admin of a group chat containing users other than ' +
      "yourself. You'll need to first appoint a different user as an admin " +
      'in order to be able to delete your account.',
      10
    );
  else if (error instanceof InvalidChatIdError)
    message.error('You are no longer in the chat.');
  else if (error instanceof UnverifiedEmailAddressError)
    message.error('You must first verify your email address.');
  else if (error instanceof InvalidActionError)
    message.error(
      'There must be at least one action, and each must be unique.'
    );
  else if (error instanceof InvalidInvitedChatError)
    message.error('That group chat is no longer accepting invites.');
  else if (error instanceof InvalidPollError)
    message.error(
      'Polls must have at least two options, all of which are unique.'
    );
  else if (error instanceof IncorrectPasswordError)
    message.error('Incorrect password.');
  else if (error instanceof InvalidInviteCodeError)
    message.error('That group chat was deleted.');
  else await handleCommonApiError(error);
}

export async function handleRestApiError(error: Error): Promise<void> {
  if (error instanceof InvalidPicError)
    message.error('The picture must be a PNG or JPEG file not exceeding 5 MB.');
  if (error instanceof InvalidAudioError)
    message.error('The audio must be an MP3 or MP4 not exceeding 5 MiB.');
  if (error instanceof InvalidVideoError)
    message.error('The video must be an MP4 not exceeding 5 MiB.');
  if (error instanceof InvalidDocError)
    message.error("The document mustn't exceeding 5 MiB.");
  else await handleCommonApiError(error);
}

async function handleCommonApiError(error: Error): Promise<void> {
  if (error instanceof ConnectionError) await displayConnectionError();
  else if (error instanceof InternalServerError) await displayBugReporter();
  else if (error instanceof UnauthorizedError) await logOut();
  else if (error instanceof UsernameScalarError)
    message.error(
      'A username must not contain whitespace, must be lowercase, and must ' +
      'be 1-30 characters long.',
      10
    );
  else if (error instanceof PasswordScalarError)
    message.error('A password must contain non-whitespace characters.');
  else if (error instanceof NameScalarError)
    message.error(
      'A name must neither contain whitespace nor exceed 30 characters.'
    );
  else if (error instanceof BioScalarError)
    message.error('A bio cannot exceed 2,500 characters.');
  else if (error instanceof GroupChatDescriptionScalarError)
    message.error(
      "A group chat's description must be at most 1,000 characters."
    );
  else if (error instanceof MessageTextScalarError)
    message.error(
      "The text must be 1-10,000 characters, of which at least one isn't " +
      'whitespace.',
      10
    );
  else if (error instanceof GroupChatTitleScalarError)
    message.error(
      "A group chat's title must be 1-70 characters, of which at least one " +
      "isn't whitespace.",
      10
    );
  else throw error;
}

/** @see {ConnectionError} */
export async function displayConnectionError(): Promise<void> {
  message.error('The server is currently unreachable.');
}

export async function displayBugReporter(): Promise<void> {
  notification.error({
    message: 'Something Went Wrong',
    description: (
      <Typography.Text>
        Please report this bug to{' '}
        <Typography.Link>neelkamathonline@gmail.com</Typography.Link>.
      </Typography.Text>
    ),
  });
}
