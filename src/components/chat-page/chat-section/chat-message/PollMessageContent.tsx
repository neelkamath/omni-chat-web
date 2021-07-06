import { ChatsSlice } from '../../../../store/slices/ChatsSlice';
import React, { ReactElement } from 'react';
import { Card, Checkbox, Space, Typography } from 'antd';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { MessageText, queryOrMutate } from '@neelkamath/omni-chat';
import { httpApiConfig, operateGraphQlApi } from '../../../../api';
import { Storage } from '../../../../Storage';
import { UpCircleTwoTone } from '@ant-design/icons';

export interface PollMessageContentProps {
  readonly message: ChatsSlice.PollMessage;
}

export default function PollMessageContent({ message }: PollMessageContentProps): ReactElement {
  return (
    <Card size='small' title={<ReactMarkdown plugins={[gfm]}>{message.poll.question}</ReactMarkdown>}>
      <Space direction='vertical'>
        {[...message.poll.options]
          .sort((a, b) => b.votes.length - a.votes.length)
          .map((pollOption) => (
            <PollOption messageId={message.messageId} key={pollOption.option} pollOption={pollOption} />
          ))}
      </Space>
    </Card>
  );
}

interface PollOptionProps {
  readonly messageId: number;
  readonly pollOption: ChatsSlice.PollOption;
}

function PollOption({ pollOption, messageId }: PollOptionProps): ReactElement {
  return (
    <Space>
      <Typography.Paragraph>
        <Checkbox
          defaultChecked={pollOption.votes.find(({ userId }) => userId === Storage.readUserId()) !== undefined}
          onChange={({ target }) => setPollVote(messageId, pollOption.option, target.checked)}
        />
      </Typography.Paragraph>
      <Typography.Paragraph style={{ color: '#177DDC' }}>
        {pollOption.votes.length} × <UpCircleTwoTone />
      </Typography.Paragraph>
      <Typography.Paragraph>
        <ReactMarkdown plugins={[gfm]}>{pollOption.option}</ReactMarkdown>
      </Typography.Paragraph>
    </Space>
  );
}

interface SetPollVoteResult {
  readonly setPollVote: InvalidMessageId | NonexistingOption | null;
}

interface NonexistingOption {
  readonly __typename: 'NonexistingOption';
}

interface InvalidMessageId {
  readonly __typename: 'InvalidMessageId';
}

async function setPollVote(
  messageId: number,
  option: MessageText,
  vote: boolean,
): Promise<SetPollVoteResult | undefined> {
  return await operateGraphQlApi(
    async () =>
      await queryOrMutate(
        httpApiConfig,
        {
          query: `
            mutation SetPollVote($messageId: Int!, $option: MessageText!, $vote: Boolean!) {
              setPollVote(messageId: $messageId, option: $option, vote: $vote) {
                __typename
              }
            }
          `,
          variables: { messageId, option, vote },
        },
        Storage.readAccessToken()!,
      ),
  );
}
