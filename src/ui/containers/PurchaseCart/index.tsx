import BNPLSchedule from '@components/BNPLSchedule';
import Button from '@components/Button';
import BuyMethodSelect, { PaymentOption } from '@components/BuyMethodSelect';
import Card from '@components/Card';
import PaymentHoverBoard from '@components/PaymentHoverBoard';
import ErrorBox from '@components/PreviewErrorBox';
import Text from '@components/Text';
import { useUsdValueOfEth } from '@hooks/useCoinPrice';
import { useAppSelector } from '@hooks/useRedux';
import { useTotalBalance } from '@hooks/useTotalBalance';
import useVoyageController from '@hooks/useVoyageController';
import { useWETHAllowance } from '@hooks/useWETHAllowance';
import PepePlacholderImg from '@images/pepe-placeholder.png';
import {
  Box,
  Divider,
  Group,
  Image,
  Loader,
  LoadingOverlay,
  Stack,
} from '@mantine/core';
import { formatAmount, fromBigNumber, Zero } from '@utils/bn';
import {
  MAX_UINT256,
  PURCHASE_OVERVIEW_ROUTE,
  VoyageContract,
} from '@utils/constants';
import {
  contractToAddress,
  getMarketplaceNameByAddress,
  getTxExplorerLink,
} from '@utils/env';
import { ReactComponent as EthSvg } from 'assets/img/eth-icon.svg';
import { ReactComponent as WalletSvg } from 'assets/img/wallet.svg';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useNavigate, useParams } from 'react-router-dom';
import { TxSpeed } from 'types';
import { PreviewErrorType, TransactionStatus } from 'types/transaction';
import SpeedSelect from './SpeedSelect';

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
  const [priceUsdValue] = useUsdValueOfEth(price || Zero);
  const interest = orderPreview?.loanParameters
    ? fromBigNumber(orderPreview.loanParameters.payment.interest)
    : undefined;
  const fee = orderPreview?.loanParameters
    ? fromBigNumber(orderPreview.loanParameters.payment.fee)
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  const marketplaceAddress =
    contractToAddress[orderPreview?.order?.marketplace as VoyageContract] ??
    ethers.constants.AddressZero;
  const [allowance, isLoadingAllowance] = useWETHAllowance(
    vaultAddress || ethers.constants.AddressZero,
    marketplaceAddress
  );
  const [approvalRequired, setApprovalRequired] = useState(false);
  console.log('order currency: ', orderPreview?.order?.currency);
  console.log('order: ', orderPreview);
  console.log(`allowance of ${marketplaceAddress} is ${allowance}`);
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
        marketplaceAddress
      );
      setApprovalTx(txHash);
      setApprovalRequired(false);
      console.log('tx hash: ', txHash);
    } catch (err) {
      console.error('failed to approve marketplace: ', err);
    } finally {
      setApproving(false);
    }
  };

  useEffect(() => {
    if (isLoading || isLoadingAllowance) {
      return;
    }

    const currency = orderPreview?.order?.currency;
    if (!isLoading && !currency) {
      console.error('Order preview lacks currency: ', orderPreview);
      return;
    }

    const isETH = currency === ethers.constants.AddressZero;
    const isMaxApproved = ethers.BigNumber.from(allowance).gte(MAX_UINT256);
    console.log('isEth: ', isETH);
    console.log('isMaxApproved: ', isMaxApproved);
    setApprovalRequired(!isETH && !isMaxApproved);
  }, [isLoading, isLoadingAllowance, allowance]);

  const sufficientBalance = balance.gte(bnplPayment || Zero);

  const canApprove = !orderPreview?.error && !errorMessage && sufficientBalance;
  const canPurchase = canApprove && !approvalRequired;

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
        {!orderPreview?.error && !sufficientBalance && (
          <ErrorBox
            mt={20}
            mb={7}
            error={{
              type: PreviewErrorType.INSUFFICIENT_BALANCE,
              message: 'INSUFFICIENT_BALANCE',
            }}
          />
        )}
        <Group mt={15} noWrap>
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
            <Group align="center" spacing={0} noWrap>
              <Text weight={'bold'} size="lg">
                {formatAmount(price) || '—'}
              </Text>
              <EthSvg style={{ width: 24 }} />
            </Group>
            <Text type="secondary" mr={8}>
              $ {priceUsdValue}
            </Text>
          </Stack>
        </Group>
        <Divider size={1.5} color="rgba(255, 255, 255, 0.35)" my={23} />
        <Stack spacing={14} align="stretch">
          <Group align="center" spacing={0}>
            <Text type="secondary" mr={4}>
              Payment Option
            </Text>
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
              <>
                <PaymentHoverBoard
                  price={price || Zero}
                  pmt={bnplPayment || Zero}
                  fee={fee || Zero}
                  interest={interest || Zero}
                  nper={nper}
                  epoch={epoch}
                />
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
              </>
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
                disabled={approving || !canApprove}
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
              disabled={!canPurchase}
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

            {!orderPreview?.error && sufficientBalance && !errorMessage && (
              <SpeedSelect
                value={speed}
                onChange={setSpeed}
                mt={12}
                vault={vaultAddress}
                user={userAddress}
              />
            )}
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
        {transaction.options.to && (
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
                {getMarketplaceNameByAddress(
                  transaction.options.to.toLowerCase()
                )}
              </strong>
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
};

export default PurchaseCart;
