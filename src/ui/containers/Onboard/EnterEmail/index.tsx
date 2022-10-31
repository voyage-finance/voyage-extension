import Button from '@components/Button';
import Card from '@components/Card';
import Input from '@components/Input';
import Text from '@components/Text';
import useVoyageController from '@hooks/useVoyageController';
import { ReactComponent as Voyage } from '@images/logo-menu.svg';
import VoyageTestnet from '@images/logo-menu-testnet.png';
import { Group, Image } from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { encodeRedirectUri, webAuth } from '@utils/auth';
import { config } from '@utils/env';
import { createRandomFingerprint } from '@utils/random';
import * as React from 'react';
import { useState } from 'react';
import browser from 'webextension-polyfill';
import * as Yup from 'yup';
import { ChainID } from '@utils/constants';

const EnterEmailStep: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const controller = useVoyageController();

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: yupResolver(
      Yup.object().shape({
        email: Yup.string()
          .email('Enter a valid email address.')
          .required('Email required'),
      })
    ),
  });

  const onFormSubmit = async () => {
    try {
      setIsLoading(true);
      const { email } = form.values;
      const generatedFingerPrint = createRandomFingerprint();
      const encodedRedirectUri = encodeRedirectUri(email, generatedFingerPrint);
      const extension_id = browser.runtime.id;
      const redirectUri = `${config.voyageWebUrl}/onboard?encoded=${encodedRedirectUri}&extension_id=${extension_id}`;
      await new Promise((resolve, reject) => {
        webAuth.passwordlessStart(
          {
            connection: 'email',
            send: 'link',
            email,
            authParams: { state: generatedFingerPrint, redirectUri },
          },
          (err, res) => {
            if (err) {
              return reject(err);
            }
            resolve(res);
          }
        );
      });
      await controller.startLogin(email, generatedFingerPrint);
    } catch (error) {
      setError((error as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      style={{
        width: 420,
        height: 372,
        margin: 'auto',
        padding: '72px 60px',
      }}
    >
      <form onSubmit={form.onSubmit(onFormSubmit)}>
        <Group direction="column" align={'center'} spacing={0}>
          {config.chainId == ChainID.Goerli ? (
            <Image src={VoyageTestnet} />
          ) : (
            <Voyage />
          )}
          {config.chainId == ChainID.Mainnet && (
            <Text mt={12}>Supercharge your collection.</Text>
          )}
          <Input
            placeholder="Enter Yar Email"
            {...form.getInputProps('email')}
            width={300}
            mt={32}
          />
          <Button fullWidth mt={26} loading={isLoading} type="submit">
            Login / Create Wallet
          </Button>
          {error && (
            <Text mt={16} type="danger" align="center">
              Error: {error}
            </Text>
          )}
        </Group>
      </form>
    </Card>
  );
};

export default EnterEmailStep;
