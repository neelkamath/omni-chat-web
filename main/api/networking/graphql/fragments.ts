export const CREATED_SUBSCRIPTION_FRAGMENT = `
    ... on CreatedSubscription {
        __typename
        placeholder
    }
`;

export const NEW_CONTACT_FRAGMENT = `
    ... on NewContact {
        __typename
        id
        username
        emailAddress
        firstName
        lastName
        bio
    }
`;

export const UPDATED_ACCOUNT_FRAGMENT = `
    ... on UpdatedAccount {
        __typename
        userId
        username
        emailAddress
        firstName
        lastName
        bio
    }
`;

export const DELETED_CONTACT_FRAGMENT = `
    ... on DeletedContact {
        __typename
        id
    }
`;

export const BLOCKED_ACCOUNT_FRAGMENT = `
    ... on BlockedAccount {
        __typename
        id
        username
        emailAddress
        firstName
        lastName
        bio
    }
`;

export const UNBLOCKED_ACCOUNT_FRAGMENT = `
    ... on UnblockedAccount {
        __typename
        id
    }
`;

export const TOKEN_SET_FRAGMENT = `
    ... on TokenSet {
        __typename
        accessToken
        refreshToken
    }
`;

export const ACCOUNT_FRAGMENT = `
    ... on Account {
        __typename
        id
        username
        emailAddress
        firstName
        lastName
        bio
    }
`;

export const ACCOUNT_EDGE_FRAGMENT = `
    ... on AccountEdge {
        __typename
        node {
            ${ACCOUNT_FRAGMENT}
        }
        cursor
    }
`;

export const PAGE_INFO_FRAGMENT = `
    ... on PageInfo {
        __typename
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
    }
`;

export const ACCOUNTS_CONNECTION_FRAGMENT = `
    ... on AccountsConnection {
        __typename
        edges {
            ${ACCOUNT_EDGE_FRAGMENT}
        }
        pageInfo {
            ${PAGE_INFO_FRAGMENT}
        }
    }
`;

export const MESSAGE_DATE_TIME_STATUS_FRAGMENT = `
    ... on MessageDateTimeStatus {
        __typename
        user {
            ${ACCOUNT_FRAGMENT}
        }
        dateTime
        status
    }
`;

export const MESSAGE_DATE_TIMES_FRAGMENT = `
    ... on MessageDateTimes {
        __typename
        sent
        statuses {
            ${MESSAGE_DATE_TIME_STATUS_FRAGMENT}
        }
    }
`;

export const MESSAGE_CONTEXT_FRAGMENT = `
    ... on MessageContext {
        __typename
        hasContext
        id
    }
`;

export const TEXT_MESSAGE_FRAGMENT = `
    ... on TextMessage {
        __typename
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
        message
    }
`;

export const AUDIO_MESSAGE_FRAGMENT = `
    ... on AudioMessage {
        __typename
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
    }
`;

export const GROUP_CHAT_INVITE_MESSAGE_FRAGMENT = `
    ... on GroupChatInviteMessage {
        __typename
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
        inviteCode
    }
`;

export const DOC_MESSAGE_FRAGMENT = `
    ... on DocMessage {
        __typename
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
    }
`;

export const VIDEO_MESSAGE_FRAGMENT = `
    ... on VideoMessage {
        __typename
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
    }
`;

export const PIC_MESSAGE_FRAGMENT = `
    ... on PicMessage {
        __typename
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
        caption
    }
`;

export const POLL_OPTION_FRAGMENT = `
    ... on PollOption {
        __typename
        option
        votes
    }
`;

export const POLL_FRAGMENT = `
    ... on Poll {
        __typename
        title
        options {
            ${POLL_OPTION_FRAGMENT}
        }
    }
`;

export const POLL_MESSAGE_FRAGMENT = `
    ... on PollMessage {
        __typename
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
        poll {
            ${POLL_FRAGMENT}
        }
    }
`;

export const MESSAGE_FRAGMENT = `
    ${TEXT_MESSAGE_FRAGMENT}
    ${AUDIO_MESSAGE_FRAGMENT}
    ${GROUP_CHAT_INVITE_MESSAGE_FRAGMENT}
    ${DOC_MESSAGE_FRAGMENT}
    ${VIDEO_MESSAGE_FRAGMENT}
    ${PIC_MESSAGE_FRAGMENT}
    ${POLL_MESSAGE_FRAGMENT}
`;

export const MESSAGE_EDGE_FRAGMENT = `
    ... on MessageEdge {
        __typename
        node {
            ${MESSAGE_FRAGMENT}
        }
        cursor
    }
`;

export const MESSAGES_CONNECTION_FRAGMENT = `
    ... on MessagesConnection {
        __typename
        edges {
            ${MESSAGE_EDGE_FRAGMENT}
        }
        pageInfo {
            ${PAGE_INFO_FRAGMENT}
        }
    }
`;

export const PRIVATE_CHAT_FRAGMENT = `
    ... on PrivateChat {
        __typename
        id
        messages(last: $privateChat_messages_last, before: $privateChat_messages_before) {
            ${MESSAGES_CONNECTION_FRAGMENT}
        }
        user {
            ${ACCOUNT_FRAGMENT}
        }
    }
`;

export const ACCOUNTS_SUBSCRIPTION_FRAGMENT = `
    ${CREATED_SUBSCRIPTION_FRAGMENT}
    ${NEW_CONTACT_FRAGMENT}
    ${UPDATED_ACCOUNT_FRAGMENT}
    ${DELETED_CONTACT_FRAGMENT}
    ${BLOCKED_ACCOUNT_FRAGMENT}
    ${UNBLOCKED_ACCOUNT_FRAGMENT}
`;

export const UPDATED_ONLINE_STATUS_FRAGMENT = `
    ... on UpdatedOnlineStatus {
        __typename
        userId
        isOnline
    }
`;

export const ONLINE_STATUSES_SUBSCRIPTION_FRAGMENT = `
    ${CREATED_SUBSCRIPTION_FRAGMENT}
    ${UPDATED_ONLINE_STATUS_FRAGMENT}
`;

export const TYPING_STATUS_FRAGMENT = `
    ... on TypingStatus {
        __typename
        chatId
        userId
        isTyping
    }
`;

export const TYPING_STATUSES_SUBSCRIPTION_FRAGMENT = `
    ${CREATED_SUBSCRIPTION_FRAGMENT}
    ${TYPING_STATUS_FRAGMENT}
`;

export const NEW_TEXT_MESSAGE_FRAGMENT = `
    ... on NewTextMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        message
    }
`;

export const ACTIONABLE_MESSAGE_FRAGMENT = `
    ... on ActionableMessage {
        __typename
        text
        actions
    }
`;

export const NEW_ACTION_MESSAGE_FRAGMENT = `
    ... on NewActionMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        message {
            ${ACTIONABLE_MESSAGE_FRAGMENT}
        }
    }
`;

export const NEW_PIC_MESSAGE_FRAGMENT = `
    ... on NewPicMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        caption
    }
`;

export const NEW_AUDIO_MESSAGE_FRAGMENT = `
    ... on NewAudioMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
    }
`;

export const NEW_GROUP_CHAT_INVITE_MESSAGE_FRAGMENT = `
    ... on NewGroupChatInviteMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        inviteCode
    }
`;

export const NEW_DOC_MESSAGE_FRAGMENT = `
    ... on NewDocMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
    }
`;

export const NEW_VIDEO_MESSAGE_FRAGMENT = `
    ... on NewVideoMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
    }
`;

export const NEW_POLL_MESSAGE_FRAGMENT = `
    ... on NewPollMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        poll {
            ${POLL_FRAGMENT}
        }
    }
`;

export const UPDATED_TEXT_MESSAGE_FRAGMENT = `
    ... on UpdatedTextMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
        message
    }
`;

export const UPDATED_ACTION_MESSAGE_FRAGMENT = `
    ... on UpdatedActionMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
        message {
            ${ACTIONABLE_MESSAGE_FRAGMENT}
        }
    }
`;

export const UPDATED_PIC_MESSAGE_FRAGMENT = `
    ... on UpdatedPicMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
        caption
    }
`;

export const UPDATED_AUDIO_MESSAGE_FRAGMENT = `
    ... on UpdatedAudioMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
    }
`;

export const UPDATED_GROUP_CHAT_INVITE_MESSAGE_FRAGMENT = `
    ... on UpdatedGroupChatInviteMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
        inviteCode
    }
`;

export const UPDATED_DOC_MESSAGE_FRAGMENT = `
    ... on UpdatedDocMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
    }
`;

export const UPDATED_VIDEO_MESSAGE_FRAGMENT = `
    ... on UpdatedVideoMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
    }
`;

export const UPDATED_POLL_MESSAGE_FRAGMENT = `
    ... on UpdatedPollMessage {
        __typename
        chatId
        messageId
        sender {
            ${ACCOUNT_FRAGMENT}
        }
        dateTimes {
            ${MESSAGE_DATE_TIMES_FRAGMENT}
        }
        context {
            ${MESSAGE_CONTEXT_FRAGMENT}
        }
        isForwarded
        hasStar
        poll {
            ${POLL_FRAGMENT}
        }
    }
`;

export const TRIGGERED_ACTION_FRAGMENT = `
    ... on TriggeredAction {
        __typename
        messageId
        action
        triggeredBy {
            ${ACCOUNT_FRAGMENT}
        }
    }
`;

export const DELETED_MESSAGE_FRAGMENT = `
    ... on DeletedMessage {
        __typename
        chatId
        messageId
    }
`;

export const MESSAGE_DELETION_POINT_FRAGMENT = `
    ... on MessageDeletionPoint {
        __typename
        chatId
        until
    }
`;

export const DELETION_OF_EVERY_MESSAGE_FRAGMENT = `
    ... on DeletionOfEveryMessage {
        __typename
        chatId
    }
`;

export const USER_CHAT_MESSAGES_REMOVAL = `
    ... on UserChatMessagesRemoval {
        __typename
        chatId
        userId
    }
`;

export const MESSAGES_SUBSCRIPTION_FRAGMENT = `
    ${CREATED_SUBSCRIPTION_FRAGMENT}
    ${NEW_TEXT_MESSAGE_FRAGMENT}
    ${NEW_ACTION_MESSAGE_FRAGMENT}
    ${NEW_PIC_MESSAGE_FRAGMENT}
    ${NEW_AUDIO_MESSAGE_FRAGMENT}
    ${NEW_GROUP_CHAT_INVITE_MESSAGE_FRAGMENT}
    ${NEW_DOC_MESSAGE_FRAGMENT}
    ${NEW_VIDEO_MESSAGE_FRAGMENT}
    ${NEW_POLL_MESSAGE_FRAGMENT}
    ${UPDATED_TEXT_MESSAGE_FRAGMENT}
    ${UPDATED_ACTION_MESSAGE_FRAGMENT}
    ${UPDATED_PIC_MESSAGE_FRAGMENT}
    ${UPDATED_AUDIO_MESSAGE_FRAGMENT}
    ${UPDATED_GROUP_CHAT_INVITE_MESSAGE_FRAGMENT}
    ${UPDATED_DOC_MESSAGE_FRAGMENT}
    ${UPDATED_VIDEO_MESSAGE_FRAGMENT}
    ${UPDATED_POLL_MESSAGE_FRAGMENT}
    ${TRIGGERED_ACTION_FRAGMENT}
    ${DELETED_MESSAGE_FRAGMENT}
    ${MESSAGE_DELETION_POINT_FRAGMENT}
    ${DELETION_OF_EVERY_MESSAGE_FRAGMENT}
    ${USER_CHAT_MESSAGES_REMOVAL}
`;

export const GROUP_CHAT_ID_FRAGMENT = `
    ... on GroupChatId {
        __typename
        id
    }
`;

export const UPDATED_GROUP_CHAT_FRAGMENT = `
    ... on UpdatedGroupChat {
        __typename
        chatId: Int!
        title
        description
        newUsers {
            ${ACCOUNT_FRAGMENT}
        }
        removedUsers {
            ${ACCOUNT_FRAGMENT}
        }
        adminIdList
        isBroadcast
        publicity
    }
`;

export const EXITED_USER_FRAGMENT = `
    ... on ExitedUser {
        __typename
        chatId
        userId
    }
`;

export const GROUP_CHATS_SUBSCRIPTION_FRAGMENT = `
    ${CREATED_SUBSCRIPTION_FRAGMENT}
    ${GROUP_CHAT_ID_FRAGMENT}
    ${UPDATED_GROUP_CHAT_FRAGMENT}
    ${EXITED_USER_FRAGMENT}
`;

export const GROUP_CHAT_FRAGMENT = `
    ... on GroupChat {
        __typename
        id
        title
        description
        adminIdList
        users(first: $groupChat_users_first, after: $groupChat_users_after) {
            ${ACCOUNTS_CONNECTION_FRAGMENT}
        }
        messages(last: $groupChat_messages_last, before: $groupChat_messages_before) {
            ${MESSAGES_CONNECTION_FRAGMENT}
        }
        isBroadcast
        publicity
        inviteCode
    }
`;

export const CHAT_FRAGMENT = `
    ${PRIVATE_CHAT_FRAGMENT}
    ${GROUP_CHAT_FRAGMENT}
`;

export const ONLINE_STATUS_FRAGMENT = `
    ... on OnlineStatus {
        __typename
        userId
        isOnline
        lastOnline
    }
`;
