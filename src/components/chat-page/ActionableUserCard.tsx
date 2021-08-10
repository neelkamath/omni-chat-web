import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Card, Col, Popconfirm, Row, Spin, Typography } from 'antd';
import ProfileModal from './ProfileModal';
import { useDispatch, useSelector } from 'react-redux';
import { ImagesSlice } from '../../store/slices/ImagesSlice';
import CustomImage from './CustomImage';
import { AccountsSlice } from '../../store/slices/AccountsSlice';
import { RootState } from '../../store/store';

/**
 * If `undefined`, then a {@link ProfileModal} will be displayed when the {@link ActionableUserCard} is clicked.
 * Otherwise, a {@link Popconfirm} will be displayed.
 */
export type CardPopconfirmation = PopconfirmationProps | undefined;

/** Content to display on the top-right of the specified user's {@link ActionableUserCard}. */
export type CardExtra = (userId: number) => ReactNode;

export interface ActionableUserCardProps {
  readonly userId: number;
  readonly popconfirmation?: CardPopconfirmation;
  readonly extraRenderer?: CardExtra;
}

export interface PopconfirmationProps {
  readonly title: string;
  readonly onConfirm: (userId: number) => Promise<void>;
}

export default function ActionableUserCard({
  userId,
  popconfirmation,
  extraRenderer,
}: ActionableUserCardProps): ReactElement {
  const [isVisible, setVisible] = useState(false);
  const card = <UserCard extraRenderer={extraRenderer} userId={userId} onClick={() => setVisible(true)} />;
  if (popconfirmation === undefined)
    return (
      <>
        {card}
        <ProfileModal userId={userId} isVisible={isVisible} onCancel={() => setVisible(false)} hasChatButton />
      </>
    );
  return (
    <Popconfirm title={popconfirmation.title} placement='right' onConfirm={() => popconfirmation.onConfirm(userId)}>
      {card}
    </Popconfirm>
  );
}

interface UserCardProps {
  readonly userId: number;
  readonly onClick: () => void;
  readonly extraRenderer?: (userId: number) => ReactNode;
}

function UserCard({ userId, onClick, extraRenderer }: UserCardProps): ReactElement {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(AccountsSlice.fetchAccount(userId));
  }, [dispatch, userId]);
  const username = useSelector((state: RootState) => AccountsSlice.select(state, userId))?.username;
  const name = username === undefined ? <Spin size='small' /> : <Typography.Text strong>{username}</Typography.Text>;
  return (
    <Card extra={extraRenderer === undefined ? undefined : extraRenderer(userId)} hoverable onClick={onClick}>
      <Row gutter={16} align='middle'>
        <Col>
          <ProfileImage userId={userId} />
        </Col>
        <Col>{name}</Col>
      </Row>
    </Card>
  );
}

interface ProfileImageProps {
  readonly userId: number;
}

function ProfileImage({ userId }: ProfileImageProps): ReactElement {
  const dispatch = useDispatch();
  /*
  A <NonexistentUserIdError> will occur if a user who was to be displayed in the search results deleted their account in
  between being searched, and having the profile image displayed. Since this rarely ever happens, and no harm comes from
  leaving the search result up, we ignore this possibility.
   */
  const url = useSelector((state: RootState) => ImagesSlice.selectImage(state, 'PROFILE_IMAGE', userId, 'THUMBNAIL'));
  useEffect(() => {
    dispatch(ImagesSlice.fetchImage({ id: userId, type: 'PROFILE_IMAGE' }));
  }, [dispatch, userId]);
  return <CustomImage icon={<UserOutlined />} url={url} />;
}
