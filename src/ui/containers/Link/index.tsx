import Button from '@components/Button';
import { useAppSelector } from '@hooks/useRedux';
import { ReactComponent as Logo } from '@images/logo-splash.svg';
import { Text } from '@mantine/core';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import styles from './index.module.scss';

const truncateAddress = (address?: string) => {
  if (!address) return '';
  const head = address.slice(2, 6);
  const tail = address.slice(38);
  return `0x${head}...${tail}`;
};

const Home: React.FC = () => {
  const { isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();

  const approvals = useAppSelector((state) => {
    return state.core.pendingApprovals;
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (Object.keys(approvals)?.length > 0) {
      const [approvalId] = Object.keys(approvals);
      navigate(`/approval/${approvalId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isConnected) navigate('/home');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isConnected ? null : (
    <div className={styles.root}>
      <div className={styles.logo}>
        <Logo />
      </div>
      <div className={styles.buttonContainer}>
        <Text className={styles.copy} color="white" size="md">
          Connect your wallet to begin your Voyage.
        </Text>
        <Button component="button" onClick={() => connect()}>
          Connect Metamask
        </Button>
      </div>
    </div>
  );
};

export default Home;
