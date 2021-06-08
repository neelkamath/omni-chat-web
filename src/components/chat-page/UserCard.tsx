import React, { ReactElement, useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';
import ProfileModal from './ProfileModal';
import { useSelector } from 'react-redux';
import { PicsSlice } from '../../store/slices/PicsSlice';
import { RootState, useThunkDispatch } from '../../store/store';
import CustomPic from './CustomPic';
import { SearchedUsersSlice } from '../../store/slices/SearchedUsersSlice';

export interface UserCardProps {
  readonly account: SearchedUsersSlice.Account;
}

export default function UserCard({ account }: UserCardProps): ReactElement {
  const [isVisible, setVisible] = useState(false);
  return (
    <>
      <Card hoverable={true} onClick={() => setVisible(true)}>
        <Row gutter={16} align='middle'>
          <Col>
            <ProfilePic userId={account.userId} />
          </Col>
          <Col>
            <Typography.Text strong>{account.username}</Typography.Text>
          </Col>
        </Row>
      </Card>
      <ProfileModal account={account} isVisible={isVisible} onCancel={() => setVisible(false)} hasChatButton={true} />
    </>
  );
}

interface ProfilePicProps {
  readonly userId: number;
}

function ProfilePic({ userId }: ProfilePicProps): ReactElement {
  /*
  A <NonexistentUserIdError> will occur if a user who was to be displayed in the search results deleted their account in
  between being searched, and having the profile pic displayed. Since this rarely ever happens, and no harm comes from
  leaving the search result up, we ignore this possibility.
   */
  const url = useSelector((state: RootState) => PicsSlice.selectPic(state, 'PROFILE_PIC', userId, 'THUMBNAIL'));
  useThunkDispatch(PicsSlice.fetchPic({ id: userId, type: 'PROFILE_PIC' }));
  return <CustomPic icon={<UserOutlined />} url={url} />;
}