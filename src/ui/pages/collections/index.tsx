import Button from '@components/Button';
import Text from '@components/Text';
import { ReactComponent as ArrowUpRightGradient } from '@images/arrow-top-right-gradient.svg';
import { ReactComponent as ArrowUpRightSvg } from '@images/arrow-up-right-icon.svg';
import { Stack } from '@mantine/core';
import { useState } from 'react';
import styles from './index.module.scss';

const CollectionsPage: React.FunctionComponent = () => {
  const [hover, setHover] = useState(false);
  console.log('hover: ', hover);
  return (
    <div className={styles.wrapper}>
      <Stack className={styles.root} spacing={6}>
        <Text size="lg" my="auto" align="center" weight={700}>
          Collections Coming Soon.
        </Text>
        <Text size="md" align="center" sx={{ marginBottom: '18px' }}>
          You may view your NFT collection on Etherscan.
        </Text>
        <Button
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          rightIcon={hover ? <ArrowUpRightGradient /> : <ArrowUpRightSvg />}
          kind="secondary"
          classNames={{
            root: styles.buttonRoot,
            inner: styles.buttonInner,
            rightIcon: styles.rightIcon,
          }}
        >
          <div>View My Collection</div>
        </Button>
      </Stack>
    </div>
  );
};

export default CollectionsPage;
