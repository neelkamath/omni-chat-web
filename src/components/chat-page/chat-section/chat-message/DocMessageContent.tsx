import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileMessagesSlice } from '../../../../store/slices/FileMessagesSlice';
import { RootState } from '../../../../store/store';
import { Button, Space, Spin, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

export interface DocMessageContentProps {
  readonly messageId: number;
}

export default function DocMessageContent({ messageId }: DocMessageContentProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(FileMessagesSlice.fetch({ messageId, type: 'DOC' }));
  }, [dispatch, messageId]);
  const file = useSelector((state: RootState) => FileMessagesSlice.selectFile(state, messageId));
  if (file.url === undefined) return <Spin />;
  return (
    <Button>
      <Typography.Link download={file.filename} href={file.url}>
        <Space>
          <DownloadOutlined /> Download {file.filename}
        </Space>
      </Typography.Link>
    </Button>
  );
}
