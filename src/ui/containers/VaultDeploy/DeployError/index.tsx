import Card from '@components/Card';
import Text from '@components/Text';
import { Group, Image } from '@mantine/core';
import * as React from 'react';
import SwordPng from 'assets/img/sword.png';
import Button from '@components/Button';

const VaultDeployError: React.FC = () => {
  const onTryClicked = () => {
    controller.cancelLogin();
  };

  return (
    <Card
      style={{
        width: 480,
        margin: 'auto',
        padding: '50px',
      }}
    >
      <Group direction="column" align={'center'} spacing={0}>
        <Image src={SwordPng} height={84} width={111} alt="Voyage sword" />
        <Text sx={{ fontSize: 24 }} mt={30} weight={'bold'} type="gradient">
          Oops, something went wrong!
        </Text>
        <Text mt={16} align="center" weight={'bold'}>
          We were unable to create your vault.
        </Text>
        <Text align="center" mt={14}>
          Please try logging in again.
        </Text>
        <Button mt={20} fullWidth onClick={onTryClicked}>
          Try Again
        </Button>
      </Group>
    </Card>
  );
};

export default VaultDeployError;
