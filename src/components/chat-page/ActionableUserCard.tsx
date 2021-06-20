import React, { ReactElement, ReactNode, useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Card, Col, Popconfirm, Row, Spin, Typography } from 'antd';
import ProfileModal from './ProfileModal';
import { useSelector } from 'react-redux';
import { PicsSlice } from '../../store/slices/PicsSlice';
import { RootState, useThunkDispatch } from '../../store/store';
import CustomPic from './CustomPic';
import { SearchedUsersSlice } from '../../store/slices/SearchedUsersSlice';
import { AccountsSlice } from '../../store/slices/AccountsSlice';

/**
 * If `undefined`, then a {@link ProfileModal} will be displayed when the {@link ActionableUserCard} is clicked.
 * Otherwise, a {@link Popconfirm} will be displayed.
 */
export type CardPopconfirmation = PopconfirmationProps;

/** Content to display on the top-right of the specified user's {@link ActionableUserCard}. */
export type CardExtra = (userId: number) => ReactNode;

export interface ActionableUserCardProps {
  readonly account: SearchedUsersSlice.Account;
  readonly popconfirmation?: CardPopconfirmation;
  readonly extraRenderer?: CardExtra;
}

export interface PopconfirmationProps {
  readonly title: string;
  readonly onConfirm: (userId: number) => Promise<void>;
}

export default function ActionableUserCard({
  account,
  popconfirmation,
  extraRenderer,
}: ActionableUserCardProps): ReactElement {
  const [isVisible, setVisible] = useState(false);
  const card = <UserCard extraRenderer={extraRenderer} account={account} onClick={() => setVisible(true)} />;
  if (popconfirmation === undefined)
    return (
      <>
        {card}
        <ProfileModal account={account} isVisible={isVisible} onCancel={() => setVisible(false)} hasChatButton />
      </>
    );
  return (
    <Popconfirm
      title={popconfirmation.title}
      placement='right'
      onConfirm={() => popconfirmation.onConfirm(account.userId)}
    >
      {card}
    </Popconfirm>
  );
}

interface UserCardProps {
  readonly account: SearchedUsersSlice.Account;
  readonly onClick: () => void;
  readonly extraRenderer?: (userId: number) => ReactNode;
}

function UserCard({ account, onClick, extraRenderer }: UserCardProps): ReactElement {
  useThunkDispatch(AccountsSlice.fetch(account.userId));
  const username = useSelector((state: RootState) => AccountsSlice.select(state, account.userId))?.username;
  const name = username === undefined ? <Spin size='small' /> : <Typography.Text strong>{username}</Typography.Text>;
  return (
    <Card extra={extraRenderer === undefined ? undefined : extraRenderer(account.userId)} hoverable onClick={onClick}>
      <Row gutter={16} align='middle'>
        <Col>
          <ProfilePic userId={account.userId} />
        </Col>
        <Col>{name}</Col>
      </Row>
    </Card>
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
  useThunkDispatch(PicsSlice.fetch({ id: userId, type: 'PROFILE_PIC' }));
  return <CustomPic icon={<UserOutlined />} url={url} />;
}
