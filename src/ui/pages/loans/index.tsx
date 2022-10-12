import TitleWithLine from '@components/atoms/TitleWithLine';
import { LoadingOverlay, Stack } from '@mantine/core';
import * as React from 'react';
import Text from '@components/Text';
import styles from './index.module.scss';

import { useFetchMyLoans } from '@hooks/useFetchMyLoans';
import LoanCard from '@components/moleculas/LoanCard';

// interface IBillPageProps {}

const LoanListPage: React.FunctionComponent = () => {
  const [loans, isLoansLoading] = useFetchMyLoans();

  return (
    <div className={styles.wrapper}>
      <Stack className={styles.root}>
        <LoadingOverlay visible={isLoansLoading} />
        <TitleWithLine>Positions</TitleWithLine>
        {loans.length == 0 && (
          <Text size="sm" my="auto" align="center">
            You have no active loans.
          </Text>
        )}
        <Stack spacing={8}>
          {loans.map((loan, index) => {
            return <LoanCard loan={loan} key={index} />;
          })}
        </Stack>
      </Stack>
    </div>
  );
};

export default LoanListPage;
