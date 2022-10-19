import NftSelector from '@components/moleculas/NftSelector';
import { Stack, TextInput } from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import * as React from 'react';
import { CollectionAsset } from 'types';
import styles from './index.module.scss';
import * as Yup from 'yup';
import Button from '@components/Button';

const NFTForm: React.FunctionComponent = () => {
  const form = useForm({
    initialValues: {
      address: '',
    },
    validate: yupResolver(
      Yup.object().shape({
        address: Yup.string().email('Invalid email').required('Email required'),
      })
    ),
  });

  const [selectedNft, setSelectedNft] = React.useState<CollectionAsset>();
  return (
    <Stack>
      <NftSelector value={selectedNft} onChange={setSelectedNft} />
      <TextInput
        placeholder="Enter recipient address"
        className={styles.addressInput}
        size="md"
        {...form.getInputProps('address')}
      />
      <Button fullWidth mt={12}>
        Send
      </Button>
    </Stack>
  );
};

export default NFTForm;
