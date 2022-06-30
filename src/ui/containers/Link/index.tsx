import Button from '@components/Button';
import { useAppSelector } from '@hooks/useRedux';
import { ReactComponent as Logo } from '@images/logo-splash.svg';
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import { Text } from '@mantine/core';
import styles from './index.module.scss';
import { ExtensionConnector } from '@web3/connector';

const truncateAddress = (address?: string) => {
  if (!address) return '';
  const head = address.slice(2, 6);
  const tail = address.slice(38);
  return `0x${head}...${tail}`;
};

const Home: React.FC = () => {
  const { provider, controller } = globalThis;
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();

  console.log('is connecting: ', isConnecting);
  console.log('is connected: ', isConnected);

  // if (error) {
  //   console.error('error connecting: ', error);
  // }

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
  }, [isConnected]);

  return (
    <div className={styles.root}>
      <div className={styles.logo}>
        <Logo />
      </div>
      {/* {web3.connected && (
        <div className={styles.statusBar}>
          <div className={styles.metaMaskFox}>
            <MetaMaskFox />
          </div>
          <div className={styles.address}>
            <Code color="teal">{truncateAddress(account?.address)}</Code>
          </div>
          <ActionIcon color="red" onClick={disconnect} variant="transparent">
            <Unlink size={18} />
          </ActionIcon>
        </div>
      )} */}
      {/* TODO: fetch actual vaults here */}
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
