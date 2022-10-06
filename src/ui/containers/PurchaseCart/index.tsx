import Card from '@components/Card';
import Text from '@components/Text';
import {
  Box,
  Divider,
  Group,
  Image,
  Loader,
  LoadingOverlay,
  Stack,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { ReactComponent as WalletSvg } from 'assets/img/wallet.svg';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import PepePlacholderImg from '@images/pepe-placeholder.png';
import Button from '@components/Button';
import BuyMethodSelect, { PaymentOption } from '@components/BuyMethodSelect';
import PaymentHoverBoard from '@components/PaymentHoverBoard';
import BNPLSchedule from '@components/BNPLSchedule';
import { useAppSelector } from '@hooks/useRedux';
import SpeedSelect from './SpeedSelect';
import { formatAmount, fromBigNumber, Zero } from '@utils/bn';
import useVoyageController from '@hooks/useVoyageController';
import { useNavigate, useParams } from 'react-router-dom';
import { MAX_UINT256, PURCHASE_OVERVIEW_ROUTE } from '@utils/constants';
import { TransactionStatus } from 'types/transaction';
import ErrorBox from '@components/PreviewErrorBox';
import { getContractByAddress, getTxExplorerLink } from '@utils/env';
import { TxSpeed } from 'types';
import { useWETHAllowance } from '@hooks/useWETHAllowance';
import { ethers } from 'ethers';
import { useBeforeunload } from 'react-beforeunload';
import { useTotalBalance } from '@hooks/useTotalBalance';

const PurchaseCart: React.FC = () => {
  const { txId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [pmtOption, setPmtOption] = useState(PaymentOption.BNPL);
  const [speed, setSpeed] = useState(TxSpeed.FAST);
  const transaction = useAppSelector((state) => {
    return state.core.transactions[txId!];
  });
  const [errorMessage, setErrorMessage] = useState('');

  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const userAddress = useAppSelector((state) => state.core.account?.address);
  const [balance, balanceLoading] = useTotalBalance(vaultAddress);

  const controller = useVoyageController();
  const navigate = useNavigate();

  const orderPreview = transaction?.orderPreview;
  const price = orderPreview?.price
    ? fromBigNumber(orderPreview.price)
    : undefined;
  const interest = orderPreview?.loanParameters
    ? fromBigNumber(orderPreview.loanParameters.payment.interest)
    : undefined;
  const bnplPayment = orderPreview?.loanParameters
    ? fromBigNumber(orderPreview.loanParameters.payment.pmt)
    : undefined;
  const nper = orderPreview?.loanParameters
    ? Number(orderPreview.loanParameters.nper)
    : 3;
  const epoch = orderPreview?.loanParameters
    ? Number(orderPreview.loanParameters.epoch)
    : 14;

  const handleBuyClick = async () => {
    setIsPurchasing(true);
    setErrorMessage('');
    try {
      await controller.confirmTransaction(transaction.id);
      navigate(`${PURCHASE_OVERVIEW_ROUTE}/confirmed/${transaction.id}`);
    } catch (e: any) {
      console.log(e);
      setErrorMessage(e.message as string);
    }
    setIsPurchasing(false);
  };

  const handleCancelClick = () => {
    controller.rejectTransaction(transaction.id);
  };

  useBeforeunload(() => {
    controller.rejectTransaction(transaction.id);
  });

  const fetchPreview = async () => {
    setIsLoading(true);
    try {
      await controller.updateOrderPreviewData(transaction.id);
    } catch (e: any) {
      console.log('[updateOrderPreviewData]', e.message);
      setErrorMessage(e.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  const [allowance, isLoadingAllowance] = useWETHAllowance(
    vaultAddress || ethers.constants.AddressZero,
    orderPreview?.order?.marketplaceAddress
  );
  console.log('order currency: ', orderPreview?.order?.currency);
  console.log(
    `allowance of ${orderPreview?.order?.marketplaceAddress} is ${allowance}`
  );
  const approvalRequired =
    orderPreview?.order?.currency !== ethers.constants.AddressZero &&
    ethers.BigNumber.from(allowance).lt(MAX_UINT256);
  console.log('approval required: ', approvalRequired);
  const [approving, setApproving] = useState(false);
  const [approvalTx, setApprovalTx] = useState('');
  const handleApproveClick = async () => {
    try {
      if (!approving && approvalTx) {
        window.open(getTxExplorerLink(approvalTx));
        return;
      }
      setApproving(true);
      const txHash = await controller.approveMarketplaceAddress(
        orderPreview?.order?.marketplaceAddress
      );
      setApprovalTx(txHash);
      console.log('tx hash: ', txHash);
    } catch (err) {
      console.error('failed to approve marketplace: ', err);
    } finally {
      setApproving(false);
    }
  };

  return (
    <Card
      style={{
        width: 420,
        margin: 'auto',
        position: 'relative',
      }}
      py={40}
      px={56}
    >
      <LoadingOverlay visible={isLoading || isLoadingAllowance} />
      <Stack spacing={0} align="stretch">
        <Group align="center" position="apart" noWrap>
          <Text sx={{ fontSize: 32 }} weight={'bold'}>
            My cart
          </Text>
          <Group
            spacing={0}
            p={5}
            sx={{
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.1)',
              minWidth: 98,
            }}
            noWrap
          >
            <WalletSvg />
            <Text weight={'bold'} ml={'auto'}>
              {balanceLoading ? <Loader size={14} /> : formatAmount(balance)}
            </Text>
            <EthSvg style={{ width: 24 }} />
          </Group>
        </Group>
        {orderPreview?.error && (
          <ErrorBox mt={20} mb={7} error={orderPreview.error} />
        )}
        <Group mt={15}>
          {!isLoading ? (
            <Image
              width={50}
              fit="contain"
              radius={10}
              height={50}
              src={orderPreview?.metadata?.image ?? PepePlacholderImg}
              alt="image"
            />
          ) : (
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            />
          )}
          <Stack spacing={0}>
            <Text weight={'bold'} size="lg">
              {orderPreview?.metadata?.name ||
                orderPreview?.metadata?.tokenId ||
                'undefined name'}
            </Text>
            <Text type="secondary">
              {orderPreview?.metadata?.collectionName || 'undefined collection'}
            </Text>
          </Stack>
          <Stack spacing={0} ml="auto" align="end">
            <Group align="center" spacing={0}>
              <Text weight={'bold'} size="lg" ml={36}>
                {formatAmount(price) || '—'}
              </Text>
              <EthSvg style={{ width: 24 }} />
            </Group>
            <Text type="secondary" mr={8}>
              $ —
            </Text>
          </Stack>
        </Group>
        <Divider size={1.5} color="rgba(255, 255, 255, 0.35)" my={23} />
        <Stack spacing={14} align="stretch">
          <Group align="center" spacing={0}>
            <Text type="secondary" mr={4}>
              Payment Option
            </Text>
            {pmtOption === PaymentOption.BNPL && (
              <PaymentHoverBoard
                price={price || Zero}
                pmt={bnplPayment || Zero}
                interest={interest || Zero}
                nper={nper}
                epoch={epoch}
              />
            )}
            <BuyMethodSelect
              ml="auto"
              value={pmtOption}
              onChange={setPmtOption}
            />
          </Group>
          <Group align="center" spacing={0}>
            <Text type="secondary" mr={4}>
              Amount Due
            </Text>
            {pmtOption === PaymentOption.PAY_NOW ? (
              <Group ml="auto" align="center" spacing={0}>
                <Text weight={'bold'} size="lg" ml={36} type="gradient">
                  {formatAmount(price) || '—'}
                </Text>
                <EthSvg style={{ width: 24 }} />
              </Group>
            ) : (
              <Group ml="auto" direction="column" align="end" spacing={0}>
                <Group position="right" spacing={0}>
                  <Text
                    ml="auto"
                    weight="bold"
                    type="gradient"
                    style={{ lineHeight: 1 }}
                  >
                    {bnplPayment ? formatAmount(bnplPayment) : '-'}
                  </Text>
                  <EthSvg style={{ width: 18 }} />
                  <Text style={{ lineHeight: 1 }}>/ {epoch} days</Text>
                </Group>
                <Text
                  ml="auto"
                  size="sm"
                  style={{ lineHeight: 1, marginTop: -4 }}
                >
                  {nper} payments
                </Text>
              </Group>
            )}
          </Group>
        </Stack>
        {pmtOption === PaymentOption.BNPL && (
          <BNPLSchedule
            mt={20}
            nper={nper}
            epoch={epoch}
            payment={bnplPayment}
          />
        )}
        {errorMessage && (
          <Text type="danger" align="center" lineClamp={4}>
            {errorMessage}
          </Text>
        )}
        {transaction.status === TransactionStatus.Unconfirmed ? (
          <>
            {!isLoadingAllowance && approvalRequired && (
              <Button
                fullWidth
                mt={24}
                onClick={handleApproveClick}
                loading={approving}
                disabled={approving}
              >
                {approving
                  ? 'Approving...'
                  : approvalTx
                  ? 'Approved'
                  : 'Approve'}
              </Button>
            )}
            <Button
              fullWidth
              mt={24}
              onClick={handleBuyClick}
              loading={isPurchasing}
              disabled={!!orderPreview?.error || approvalRequired}
            >
              {!isPurchasing ? (
                <>
                  Pay{' '}
                  {bnplPayment &&
                    (pmtOption === PaymentOption.PAY_NOW
                      ? formatAmount(price)
                      : formatAmount(bnplPayment))}{' '}
                  {bnplPayment && <EthSvg />}
                </>
              ) : (
                'Purchasing'
              )}
            </Button>
            <Button
              fullWidth
              mt={12}
              kind="secondary"
              onClick={handleCancelClick}
            >
              Cancel
            </Button>

            <SpeedSelect
              value={speed}
              onChange={setSpeed}
              mt={12}
              vault={vaultAddress}
              user={userAddress}
            />
          </>
        ) : transaction.status === TransactionStatus.Rejected ? (
          <Button fullWidth disabled mt={24} kind="secondary">
            Rejected
          </Button>
        ) : transaction.status === TransactionStatus.Pending ? (
          <Button fullWidth disabled mt={24} kind="secondary" loading>
            Mining
          </Button>
        ) : (
          // unreachable state
          <Text align="center">Mined</Text>
        )}
        {transaction.options.to &&
          getContractByAddress(transaction.options.to.toLowerCase()) && (
            <Group position="center" mt={22} spacing={6}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(12, 205, 170, 1)',
                }}
              />
              <Text size="sm" sx={{ lineHeight: '12px' }}>
                Connected to{' '}
                <strong>
                  {getContractByAddress(transaction.options.to.toLowerCase())}
                </strong>
              </Text>
            </Group>
          )}
      </Stack>
    </Card>
  );
};

export default PurchaseCart;
