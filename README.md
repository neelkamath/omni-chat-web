# Omni Chat Web

_Trusted, Extensible, Better Chat_

![Cover](docs/cover.png)

A web app for [Omni Chat's API](https://github.com/neelkamath/omni-chat). This UI isn't mobile-friendly since native
apps should give a superior experience for chat apps. Here are the features implemented so far:

- [ ] Automatic online status. You don't manually set whether you're "away", or some other error-prone status that you
  have to constantly update, and no one takes seriously.
- [ ] Private chats. These are for conversations between two people, like you and your friend.
- [ ] See who's typing in the chat.
- [ ] See when someone's online, or when they were last online.
- [ ] Search the chat.
- [ ] When a private chat gets deleted by a user, the messages sent until then are no longer visible to them, and the
  chat is no longer retrieved when requesting their chats. However, the user they were chatting with will still have the
  chat in the same state it was in before the user deleted it. If the other user sends a message to the user, it will
  show up as the first message in the user's chat.
- [ ] Every message has the date and time it was sent, delivered, and read for each user.
- [ ] Delete messages.
- [ ] Star messages.
- [ ] Markdown support.
- [ ] Reply to a message to prevent context loss.
- Message types:
    - [ ] Text
    - [ ] Actions (i.e., buttons which trigger third-party server-side code such as ordering food via a bot)
    - [ ] Audio
    - [ ] Pictures
    - [ ] Polls
    - [ ] Videos
    - [ ] Group chat invites
    - [ ] Doc (i.e., any file type)
- Group chats (e.g., a school class's chat):
    - [ ] Multiple admins.
    - [ ] If you are added to a chat, or are added back to a chat after leaving it, you'll be able to see the entire
      chat' s history so that new participants don't miss older messages.
    - [ ] If you leave a chat, your messages will remain in the chat until you delete your account, or join the chat
      again to delete them.
    - [ ] Descriptions and icons.
    - [ ] Unlimited participants.
    - [ ] Broadcast chats (i.e., only admins can message). This option can be toggled for a chat any time. This is for
      chats for updates, like a conference's chat where you don't want hundreds of people asking the same questions over
      and over again.
    - [ ] Group chat invite codes.

      This is useful for something like a college's elective class where hundreds of students from different sections
      need to be added. Instead of admins manually adding each of them, or manually adding one person from each section
      who in turn adds their classmates, the admin can simply auto-invite users via a code so that people will forward
      it to their relevant section's chat.

      This is how it'll work. Every chat gets associated with a UUID (Universally Unique IDentifier). Any user who
      enters this code gets added to the chat. The code isn't human-readable so that hackers can't use brute force to
      join chats. Whether a chat can be joined via an invitation can be toggled by the admin; except for public chats
      where invitations are always on.
    - [ ] Public chats (e.g., official Android chat, random groups individuals have created, Mario Kart chat). People
      can search for, and view public chats without an account. Anyone with an account can join them. A frontend UI may
      allow for a search engine to index the chat should the administrator allow for it.
- [ ] Forward messages. platform, in which case they can specify that only certain email address domains can create
  accounts. This way, even if an intruder gets into the company's network, they won't be able to create an account since
  they won't have a company issued email address. This feature also prevents employees from creating an account with
  their personal email address.
- [ ] Bots can have buttons so that integrations can easily execute code. For example, if a Travis CI build fails, a bot
  could message the specifics on the group with a button, which when clicked, automatically reruns the CI/CD pipeline.
- [ ] Group audio calls.
- [ ] Group video calls.
- [ ] Screen sharing.
- [ ] Background noise cancellation for both audio and video calls.
- [ ] Spatial audio calls (important for gamers).

Here are the [branding assets](https://github.com/neelkamath/omni-chat/tree/master/branding).

## Installation

1. Install the [app](docs/install.md).
1. `npm run build`

## Usage

1. Either run the Omni Chat 0.8.3
   API [locally](https://github.com/neelkamath/omni-chat/blob/v0.8.3/docs/docker-compose.md) or in
   the [cloud](https://github.com/neelkamath/omni-chat/blob/v0.8.3/docs/cloud.md).
1. Serve the website which has been saved to `dist/`.

## Contributing

- This app supports the latest version of Chrome, Firefox, Safari, and Edge on desktops.
- "JWT" refers to [JSON Web Tokens](https://jwt.io/).
- Padding from the edges of the screen, and between elements is `16px`.
- When the user is signed in, the access token can be assumed to be valid because it's automatically refreshed
  periodically in the background. This means that if an API call results in an unauthorized error, either the user
  deleted their account, or an edge case which couldn't be handled occurred (e.g., the access token was deleted
  from `localStorage` because the browser's history was deleted). In such a case, the user must be logged out (i.e., the
  token set must be deleted, and the user must be redirected to the homepage).

### Installation

1. Install the [app](docs/install.md).
1. Configure the development environment:
    1. Copy the [`.env`](docs/.env) file to the project's root directory.
    1. If you're not running the Omni Chat API on `localhost`, change the value of the `API_URL` key (
       e.g., `localhost:8080`, `example.com/api`).
    1. If the API server has an SSL certificate, change the values of the `HTTP` and `WS` keys to `https://`
       and `wss://` respectively.

### Development

1. Either run the Omni Chat 0.8.3
   API [locally](https://github.com/neelkamath/omni-chat/blob/v0.8.3/docs/docker-compose.md) or in
   the [cloud](https://github.com/neelkamath/omni-chat/blob/v0.8.3/docs/cloud.md).
1. Run on http://localhost:1234: `npm run dev`

### Production

Here's how to test the production build:

1. Either run the Omni Chat 0.8.3
   API [locally](https://github.com/neelkamath/omni-chat/blob/v0.8.3/docs/docker-compose.md) or in
   the [cloud](https://github.com/neelkamath/omni-chat/blob/v0.8.3/docs/cloud.md).
1. Save a production build to `dist/`: `npm run build`
1. Serve the website which has been saved to `dist/`.

### Storage

[`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) is used to save data such as
access tokens. The following data may be saved:

|Key|Explanation|Example|
|---|---|---|
|`'accessToken'`|Access token (a JWT).|`'ey9.yfQ.Sfl'`|
|`'refreshToken'`|Refresh token (a JWT).|`'ey9.yfQ.Sfl'`|

## License

This project is under the [MIT License](LICENSE).
