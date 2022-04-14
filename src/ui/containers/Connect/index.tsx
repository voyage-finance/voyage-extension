import React from 'react';
import { Button } from '@mantine/core';
import { useAccount, useConnect, useSignMessage } from 'wagmi';
import styles from './index.module.scss';

interface Props {}

const Connect: React.FC<Props> = () => {
  const [{ data, error, loading }, connect] = useConnect();
  const [{ data: account }] = useAccount();
  const [{ data: signature, loading: signingMessage }, signMessage] =
    useSignMessage();
  if (error) {
    console.error('error connecting: ', error);
  }
  console.log('signature: ', signature);
  return (
    <div className={styles.root}>
      {data.connected ? (
        `Yay you are connected: ${account?.address}`
      ) : (
        <Button onClick={() => connect(data.connectors[0])}>
          Connect to metamask
        </Button>
      )}
      <Button
        disabled={!data.connected || signingMessage || loading}
        onClick={() =>
          signMessage({ message: "i'm a little teapot short and stout!" })
        }
      >
        Sign something
      </Button>
      {signature && <p>Got a signature: {signature}</p>}
    </div>
  );
};

export default Connect;
