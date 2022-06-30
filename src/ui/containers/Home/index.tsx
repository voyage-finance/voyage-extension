import React, { useEffect } from 'react';
import { ActionIcon, Button, Code } from '@mantine/core';
import { Unlink } from 'tabler-icons-react';
import { useAccount, useConnect } from 'wagmi';
import { ReactComponent as MetaMaskFox } from '@images/metamask-fox.svg';
import { ReactComponent as CrabadaLogo } from '@images/crabada-logo.svg';
import { useAppSelector } from '@hooks/useRedux';
import styles from './index.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { useNetwork } from 'wagmi';

const truncateAddress = (address?: string) => {
  if (!address) return '';
  const head = address.slice(2, 6);
  const tail = address.slice(38);
  return `0x${head}...${tail}`;
};

const Home: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  console.log('current chain: ', chain);

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

  return (
    <div className={styles.root}>
      {isConnected && (
        <div className={styles.statusBar}>
          <div className={styles.metaMaskFox}>
            <MetaMaskFox />
          </div>
          <div className={styles.address}>
            <Code color="teal">{truncateAddress(address)}</Code>
          </div>
          {/* <ActionIcon color="red" onClick={disconnect} variant="transparent">
            <Unlink size={18} />
          </ActionIcon> */}
        </div>
      )}
      {/* TODO: fetch actual vaults here */}
      <div className={styles.vault}>
        <div>
          <div>
            <CrabadaLogo />
          </div>
          <div>CrabaDAO Main Vault</div>
          <div>
            <Code>0xc494...5c43</Code>
          </div>
        </div>
      </div>
      <Button component={Link} to="/connect">
        Link to WC
      </Button>
    </div>
  );
};

export default Home;
