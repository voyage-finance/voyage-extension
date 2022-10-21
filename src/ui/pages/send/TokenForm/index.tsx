import { Group, Stack, TextInput } from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import * as React from 'react';
import styles from './index.module.scss';
import * as Yup from 'yup';
import Button from '@components/Button';
import CurrencySelector, {
  TOKEN,
} from '@components/moleculas/CurrencySelector';
import Text from '@components/Text';
import BigNumber from 'bignumber.js';
import { useEthBalance } from '@hooks/useEthBalance';
import { useWEthBalance } from '@hooks/useWEthBalance';
import { Zero } from '@utils/bn';
import { useAppSelector } from '@hooks/useRedux';
import { WETH_ADDRESS } from '@utils/constants';
import { config, getChainID } from '@utils/env';
import { ethers } from 'ethers';
import { GsnTxState } from 'types/transaction';
import TxStatusText from '@components/atoms/TxStatusText';

const TokenForm: React.FunctionComponent = () => {
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const [ethBalance] = useEthBalance(vaultAddress, true);
  const [wethBalance] = useWEthBalance(vaultAddress!, true);
  const [selectedToken, setSelectedToken] = React.useState<TOKEN>();

  const [txState, setTxState] = React.useState<GsnTxState>();
  const [txHash, setTxHash] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const web3Provider = new ethers.providers.Web3Provider(provider);

  const form = useForm({
    initialValues: {
      address: '',
      amount: '',
    },
    validate: {
      amount: (value) => {
        if (!value) {
          return 'Please input a number.';
        }

        const num = new BigNumber(value);

        if (num.lte(0)) {
          return 'Amount should be a positive number';
        }

        const balance =
          selectedToken != undefined
            ? selectedToken == TOKEN.ETH
              ? ethBalance
              : wethBalance
            : Zero;
        if (num.gt(balance)) {
          return 'Insufficient balance!';
        }

        return null;
      },
      ...yupResolver(
        Yup.object().shape({
          address: Yup.string().required('Recipiant address required'),
        })
      ),
    },
  });

  const resetForm = () => {
    form.setFieldValue('address', '');
    form.setFieldValue('amount', '');
    setSelectedToken(undefined);
  };

  const handleFormSubmit = async () => {
    if (selectedToken != undefined) {
      setTxState(GsnTxState.Started);
      setTxHash('');
      try {
        const txHash =
          selectedToken == TOKEN.ETH
            ? await controller.transferETH(
                vaultAddress!,
                form.values.address,
                form.values.amount
              )
            : await controller.transferCurrency(
                vaultAddress!,
                WETH_ADDRESS[getChainID()],
                form.values.address,
                form.values.amount
              );
        setTxState(GsnTxState.Initialized);
        setTxHash(txHash);
        await web3Provider.waitForTransaction(txHash, config.numConfirmations);
        setTxState(GsnTxState.Mined);
        resetForm();
      } catch (e: any) {
        setTxState(GsnTxState.Error);
        setErrorMessage(e.message);
        console.error(e.message);
      }
    }
  };

  React.useEffect(() => {
    setErrorMessage('');
  }, [form.values, selectedToken]);

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack pb={60}>
        <CurrencySelector value={selectedToken} onChange={setSelectedToken} />
        <TextInput
          placeholder="Enter recipient address"
          className={styles.addressInput}
          size="md"
          {...form.getInputProps('address')}
        />
        <TextInput
          placeholder="Enter amount"
          className={styles.addressInput}
          type="number"
          rightSection={
            <Group spacing={12} position="right" noWrap>
              <Button
                onClick={() =>
                  form.setFieldValue(
                    'amount',
                    (selectedToken == TOKEN.WETH
                      ? wethBalance
                      : ethBalance
                    ).toString()
                  )
                }
                style={{
                  height: 18,
                  width: 40,
                  padding: 0,
                  borderRadius: 4,
                }}
              >
                MAX
              </Button>
              <Text type="gradient" weight="bold">
                {selectedToken == TOKEN.WETH ? 'wETH' : 'ETH'}
              </Text>
            </Group>
          }
          size="md"
          styles={{
            input: {
              paddingRight: 96,
            },
            rightSection: {
              right: 12.5,
              width: 78,
            },
          }}
          {...form.getInputProps('amount')}
        />
        {errorMessage && (
          <Text type="danger" mt={12} align="center" lineClamp={4}>
            {errorMessage}
          </Text>
        )}
        {txState && txHash ? (
          <TxStatusText txHash={txHash} txState={txState} />
        ) : undefined}
        <Button
          fullWidth
          mt={12}
          loading={
            txState == GsnTxState.Started || txState == GsnTxState.Initialized
          }
          type="submit"
        >
          {txState == GsnTxState.Initialized
            ? 'Processing'
            : txState == GsnTxState.Started
            ? 'Sending'
            : 'Send'}
        </Button>
      </Stack>
    </form>
  );
};

export default TokenForm;
