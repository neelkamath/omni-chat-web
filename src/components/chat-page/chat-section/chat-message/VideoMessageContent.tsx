import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { Card, Spin } from 'antd';
import { FileMessagesSlice } from '../../../../store/slices/FileMessagesSlice';

export interface VideoMessageContentProps {
  readonly messageId: number;
}

export default function VideoMessageContent({ messageId }: VideoMessageContentProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(FileMessagesSlice.fetchMessage({ messageId, type: 'VIDEO' }));
  }, [dispatch, messageId]);
  const { filename, url } = useSelector((state: RootState) => FileMessagesSlice.selectFile(state, messageId));
  /*
  FIXME: Doesn't work in Safari. This should get fixed once we migrate to a CDN because Safari apparently requires the
   server to support media range requests. Otherwise, try a third party player to see if that fixes it.
   */
  if (url === undefined) return <Spin size='small' />;
  return (
    <Card title={filename} size='small' style={{ width: '40%' }}>
      <video controls src={url} width='100%' />
    </Card>
  );
}
