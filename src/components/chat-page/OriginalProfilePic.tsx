import React, {ReactElement} from 'react';
import {Image} from 'antd';

export interface OriginalProfilePicProps {
  readonly url: string;
}

export default function OriginalProfilePic({url}: OriginalProfilePicProps): ReactElement {
  return <Image width={500} alt="Profile picture" preview={false} src={url} />;
}
