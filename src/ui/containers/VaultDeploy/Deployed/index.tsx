import Card from '@components/Card';
import Text from '@components/Text';
import { Group } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as LogoLoadingSvg } from 'assets/img/flag.svg';
import Button from '@components/Button';
import { useNavigate } from 'react-router-dom';

const VaultDeployed: React.FC = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
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
        <LogoLoadingSvg />
        <Text sx={{ fontSize: 24 }} mt={30} weight={'bold'} type="gradient">
          Welcome Aboard Voyage!
        </Text>
        <Text mt={16} align="center" sx={{ lineHeight: '16px' }}>
          You’ve now got yourself your very own Voyage vault! Head to{' '}
          <strong>Voyage’s Discover</strong> tab and uncover the treasures that
          lie ahead.
        </Text>
        <Button fullWidth mt={26} onClick={goHome}>
          Leggo!
        </Button>
      </Group>
    </Card>
  );
};

export default VaultDeployed;
