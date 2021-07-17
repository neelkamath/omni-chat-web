import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { Card, Spin } from 'antd';
import { FileMessagesSlice } from '../../../../store/slices/FileMessagesSlice';

export interface AudioMessageContentProps {
  readonly messageId: number;
}

export default function AudioMessageContent({ messageId }: AudioMessageContentProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(FileMessagesSlice.fetch({ messageId, type: 'AUDIO' }));
  }, [dispatch, messageId]);
  const { url, filename } = useSelector((state: RootState) => FileMessagesSlice.selectFile(state, messageId));
  if (url === undefined) return <Spin size='small' />;
  return (
    <Card title={filename} size='small'>
      <audio controls src={url} />
    </Card>
  );
}
