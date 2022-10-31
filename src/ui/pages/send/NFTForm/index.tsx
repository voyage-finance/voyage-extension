import NftSelector from '@components/moleculas/NftSelector';
import { Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import * as React from 'react';
import { CollectionAsset, TxSpeed } from 'types';
import styles from './index.module.scss';
import Button from '@components/Button';
import { ethers } from 'ethers';
import { useAppSelector } from '@hooks/useRedux';
import { config } from '@utils/env';
import Text from '@components/Text';
import { GsnTxState } from 'types/transaction';
import TxStatusText from '@components/atoms/TxStatusText';
import { checkAddressChecksum } from 'ethereum-checksum-address';
import WithdrawNftSpeedSelector from './WithdrawNftSpeedSelector';

const NFTForm: React.FunctionComponent<{
  onSent: (value: CollectionAsset, recipient: string, txHash: string) => void;
}> = ({ onSent }) => {
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const [txState, setTxState] = React.useState<GsnTxState>();
  const [txHash, setTxHash] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const web3Provider = new ethers.providers.Web3Provider(provider);
  const [speed, setSpeed] = React.useState(TxSpeed.FAST);
  const [firstNft, setFirstNft] = React.useState<CollectionAsset>();

  const form = useForm<{ address: string; nft?: CollectionAsset }>({
    initialValues: {
      address: '',
    },
    validate: {
      address: (value) => {
        if (value) {
          if (value.length > 2 && checkAddressChecksum(value)) {
            return null;
          }
          return 'Enter a valid Ethereum address.';
        }
        return 'Enter recipient address.';
      },
      nft: (value) => {
        if (!value) return 'Select NFT you wish to send.';
      },
    },
  });

  const resetForm = () => {
    form.setFieldValue('address', '');
    form.setFieldValue('nft', undefined);
  };

  const handleFormSubmit = async () => {
    setTxState(GsnTxState.Started);
    setTxHash('');
    try {
      const txHash = await controller.withdrawNFT(
        vaultAddress!,
        form.values.nft!.collection.id,
        form.values.nft!.tokenId,
        form.values.address
      );
      console.log('txHash', txHash);

      setTxState(GsnTxState.Initialized);
      setTxHash(txHash);
      await web3Provider.waitForTransaction(txHash, config.numConfirmations);
      setTxState(GsnTxState.Mined);
      resetForm();
      onSent(form.values.nft!, form.values.address, txHash);
    } catch (e: any) {
      setTxState(GsnTxState.Error);
      setErrorMessage(e.message);
      console.error(e.message);
    }
  };

  React.useEffect(() => {
    setErrorMessage('');
    form.setErrors({});
  }, [form.values]);

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack pb={60}>
        <Stack spacing={5}>
          <NftSelector
            value={form.values.nft}
            onChange={(nft) => form.setFieldValue('nft', nft)}
            onListFetched={(values) => {
              if (values.length > 0) setFirstNft(values[0]);
            }}
          />
          {form.errors.nft && (
            <Text sx={{ color: '#fa5252' }}>{form.errors.nft}</Text>
          )}
        </Stack>
        <TextInput
          placeholder="Enter recipient address"
          className={styles.addressInput}
          size="md"
          {...form.getInputProps('address')}
        />
        {firstNft && (
          <WithdrawNftSpeedSelector
            value={speed}
            onChange={setSpeed}
            defaultNft={firstNft}
            vault={vaultAddress}
          />
        )}
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
        {errorMessage && (
          <Text type="danger" mt={12} align="center" lineClamp={4}>
            {errorMessage}
          </Text>
        )}
        {txState && txHash ? (
          <TxStatusText txHash={txHash} txState={txState} />
        ) : undefined}
      </Stack>
    </form>
  );
};

export default NFTForm;
