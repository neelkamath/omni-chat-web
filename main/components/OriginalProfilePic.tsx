import React, {ReactElement} from 'react';
import {Image} from 'antd';

export interface OriginalProfilePicProps {
    readonly pic: Blob;
}

export default function OriginalProfilePic({pic}: OriginalProfilePicProps): ReactElement {
    return <Image width={500} alt='Profile picture' preview={false} src={URL.createObjectURL(pic)}/>;
}
