import React, {ReactElement, useState} from 'react';
import {UserOutlined} from '@ant-design/icons';
import {Avatar, Card, Col, Row, Spin, Typography} from 'antd';
import ProfileModal from './ProfileModal';
import {Account} from '@neelkamath/omni-chat';
import {useDispatch, useSelector} from 'react-redux';
import {PicsSlice} from '../../store/slices/PicsSlice';
import {RootState} from '../../store/store';

export interface UserCardProps {
  readonly account: Account;
  /**
   * A modal displaying the user's profile is shown when the card is clicked.
   * This function is called whenever the modal is closed to perform any
   * cleanup actions you may want to perform. For example, if a list of the
   * user's contacts are being displayed, you can update the contacts list
   * because the user may have deleted a contact via the modal.
   */
  readonly onModalClose?: () => void;
}

/** Must be placed inside a {@link ChatPageLayoutContext.Provider}. */
export default function UserCard({account, onModalClose}: UserCardProps): ReactElement {
  const [isVisible, setVisible] = useState(false);
  const onCancel = () => {
    setVisible(false);
    if (onModalClose !== undefined) onModalClose();
  };
  return (
    <>
      <Card hoverable={true} onClick={() => setVisible(true)}>
        <Row gutter={16} align="middle">
          <Col>
            <ProfilePic userId={account.id} />
          </Col>
          <Col>
            <Typography.Text strong>{account.username}</Typography.Text>
          </Col>
        </Row>
      </Card>
      <ProfileModal account={account} isVisible={isVisible} onCancel={onCancel} hasChatButton={true} />
    </>
  );
}

interface ProfilePicProps {
  readonly userId: number;
}

function ProfilePic({userId}: ProfilePicProps): ReactElement {
  /*
  A <NonexistentUserIdError> will occur if a user who was to be displayed in
  the search results deleted their account in between being searched, and
  having the profile pic displayed. Since this rarely ever happens, and no
  harm comes from leaving the search result up, we ignore this possibility.
   */
  const pic = useSelector((state: RootState) => PicsSlice.selectPic(state, 'PROFILE_PIC', userId, 'THUMBNAIL'));
  const dispatch = useDispatch();
  dispatch(PicsSlice.fetchPic({id: userId, type: 'PROFILE_PIC'}));
  return pic === undefined ? (
    <Spin size="small" />
  ) : (
    <Avatar size="large" src={pic === null ? <UserOutlined /> : pic} />
  );
}
