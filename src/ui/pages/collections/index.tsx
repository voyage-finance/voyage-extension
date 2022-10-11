import { Stack } from '@mantine/core';
import * as React from 'react';
import Text from '@components/Text';
import styles from './index.module.scss';

const CollectionsPage: React.FunctionComponent = () => {
  return (
    <div className={styles.wrapper}>
      <Stack className={styles.root}>
        <Text size="sm" my="auto" align="center">
          Coming soon
        </Text>
      </Stack>
    </div>
  );
};

export default CollectionsPage;
