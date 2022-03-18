import React from 'react';
import styles from './index.module.scss';

interface Props {}

const Connect: React.FC<Props> = () => {
  return <div className={styles.root}>Connect to MetaMask</div>;
};

export default Connect;
