import NftSelector from '@components/moleculas/NftSelector';
import { Stack, TextInput } from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import * as React from 'react';
import { CollectionAsset } from 'types';
import styles from './index.module.scss';
import * as Yup from 'yup';
import Button from '@components/Button';
import { ethers } from 'ethers';
import { useAppSelector } from '@hooks/useRedux';
import { config } from '@utils/env';
import Text from '@components/Text';

const NFTForm: React.FunctionComponent = () => {
  const vaultAddress = useAppSelector((state) => state.core.vaultAddress);
  const [isSendingTx, setIsSendingTx] = React.useState(false);
  const [isMining, setIsMining] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const web3Provider = new ethers.providers.Web3Provider(provider);

  const form = useForm({
    initialValues: {
      address: '',
    },
    validate: yupResolver(
      Yup.object().shape({
        address: Yup.string().required('Recipiant address required'),
      })
    ),
  });

  const [selectedNft, setSelectedNft] = React.useState<CollectionAsset>();
  const handleFormSubmit = async () => {
    setIsSendingTx(true);
    if (selectedNft != undefined)
      try {
        const txHash = await controller.withdrawNFT(
          vaultAddress!,
          selectedNft.collection.id,
          selectedNft.tokenId,
          form.values.address
        );
        console.log('txHash', txHash);

        setIsSendingTx(false);
        setIsMining(true);
        await web3Provider.waitForTransaction(txHash, config.numConfirmations);
      } catch (e: any) {
        setErrorMessage(e.message);
        console.error(e.message);
      } finally {
        setIsSendingTx(false);
        setIsMining(false);
      }
  };

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack>
        <NftSelector value={selectedNft} onChange={setSelectedNft} />
        <TextInput
          placeholder="Enter recipient address"
          className={styles.addressInput}
          size="md"
          {...form.getInputProps('address')}
        />
        {errorMessage && (
          <Text type="danger" mt={12} align="center" lineClamp={4}>
            {errorMessage}
          </Text>
        )}
        <Button
          fullWidth
          mt={12}
          loading={isSendingTx || isMining}
          type="submit"
        >
          {isMining ? 'Processing' : isSendingTx ? 'Sending' : 'Send'}
        </Button>
      </Stack>
    </form>
  );
};

export default NFTForm;
