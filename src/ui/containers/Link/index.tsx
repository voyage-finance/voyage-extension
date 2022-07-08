import Button from '@components/Button';
import { useAppSelector } from '@hooks/useRedux';
import { ReactComponent as Logo } from '@images/logo-splash.svg';
import { Text } from '@mantine/core';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import styles from './index.module.scss';

const Home: React.FC = () => {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) navigate('/home');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return isConnected ? null : (
    <div className={styles.root}>
      <div className={styles.logo}>
        <Logo />
      </div>
      <div className={styles.buttonContainer}>
        <Text className={styles.copy} color="white" size="md">
          Connect your wallet to begin your Voyage.
        </Text>
        <Button
          component="button"
          onClick={() => connect({ connector: connectors[0] })}
        >
          Connect Metamask
        </Button>
      </div>
    </div>
  );
};

export default Home;
