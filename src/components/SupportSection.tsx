import React, { ReactElement } from 'react';
import { Typography } from 'antd';

export default function SupportSection(): ReactElement {
  return (
    <Typography.Text>
      Contact <Typography.Link>{process.env.SUPPORT_EMAIL_ADDRESS}</Typography.Link> for help, business queries, feature
      requests, and bug reports.
    </Typography.Text>
  );
}
