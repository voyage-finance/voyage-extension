import Button from '@components/Button';
import RepaymentSchedule from '@components/moleculas/RepaymentSchedule';
import Text from '@components/Text';
import { useFetchLoanRepayments } from '@hooks/useFetchLoanRepayments';
import { useAppSelector } from '@hooks/useRedux';
import { Box, LoadingOverlay } from '@mantine/core';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { formatAmount, Zero } from '@utils/bn';
import { constants, ethers } from 'ethers';
import * as React from 'react';
import { config } from '@utils/env';
import { ILoan } from 'types';

const RepaymentsWrapped: React.FunctionComponent<{
  loan: ILoan;
  refetch: () => void;
  isLoading?: boolean;
}> = ({
  loan: {
    loanId,
    nper,
    epoch,
    pmtPmt: payment,
    collection,
    paidTimes,
    borrowAt,
    transaction,
  },
  refetch,
  isLoading,
}) => {
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const [txs, setTxs] = React.useState<string[]>([]);
  const [isSendingTx, setIsSendingTx] = React.useState(false);
  const [isMining, setIsMining] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const web3Provider = new ethers.providers.Web3Provider(provider);
  const buyNowTx = transaction.txHash;

  const {
    data: loanWithRepayments,
    loading,
    refetch: refetchRepayments,
  } = useFetchLoanRepayments(vaultAddress!, loanId!);

  const handleRepayClick = async () => {
    setIsSendingTx(true);
    setErrorMessage('');
    try {
      const txHash = await controller.repay(collection, loanId!);
      setIsSendingTx(false);
      setIsMining(true);
      await web3Provider.waitForTransaction(txHash, config.numConfirmations);
      refetch();
      refetchRepayments();
    } catch (e: any) {
      setErrorMessage(e.message);
      console.error(e.message);
    } finally {
      setIsSendingTx(false);
      setIsMining(false);
    }
  };

  React.useEffect(() => {
    if (
      loanWithRepayments?.loan?.repayments &&
      loanWithRepayments.loan.repayments.length > 0
    ) {
      let txHashes = loanWithRepayments.loan.repayments.map(
        (repay) => repay.txHash
      );
      if (buyNowTx && txHashes[0] == constants.AddressZero)
        txHashes[0] = buyNowTx;
      else if (buyNowTx) {
        txHashes = [buyNowTx, ...txHashes];
      }
      setTxs(txHashes);
    }
  }, [loanWithRepayments]);

  return (
    <Box
      sx={{ position: 'relative' }}
      key={`${vaultAddress}_${collection}_${loanId}`}
    >
      <LoadingOverlay visible={loading} />
      <RepaymentSchedule
        nper={nper}
        epoch={epoch || 0}
        payment={payment || Zero}
        transactions={txs}
        borrowAt={borrowAt}
      />
      {errorMessage && (
        <Text type="danger" align="center" lineClamp={4}>
          {errorMessage}
        </Text>
      )}
      {
        <Box my={24}>
          <Button
            fullWidth
            onClick={handleRepayClick}
            loading={isSendingTx || isMining || isLoading}
            disabled={paidTimes == nper}
          >
            {paidTimes == nper ? (
              'Payment Complete'
            ) : isMining ? (
              'Mining'
            ) : isSendingTx ? (
              'Repaying'
            ) : (
              <>
                Repay {formatAmount(payment)} <EthSvg />
              </>
            )}
          </Button>
        </Box>
      }
    </Box>
  );
};

export default RepaymentsWrapped;
