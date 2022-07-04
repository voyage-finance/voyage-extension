import React, { useEffect } from 'react';
import { Button, Code } from '@mantine/core';
import { useNetwork } from 'wagmi';
import { useAppSelector } from '@hooks/useRedux';
import styles from './index.module.scss';
import { Link, useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
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
      <div className={styles.vault}>
        <div>
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
