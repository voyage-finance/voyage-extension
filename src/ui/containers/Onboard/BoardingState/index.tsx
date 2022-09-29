import Card from '@components/Card';
import Text from '@components/Text';
import { Group } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as LogoLoadingSvg } from 'assets/img/logo-loading.svg';
import useVoyageController from '@hooks/useVoyageController';
import Button from '@components/Button';

const BoardingState: React.FC = () => {
  const controller = useVoyageController();
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const finishLogin = async () => {
    setLoading(true);
    try {
      await controller.finishLogin();
    } catch (e: any) {
      console.log(e);
      setErrorMsg(e.message);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    finishLogin();
  }, []);

  return (
    <Card
      style={{
        width: 420,
        margin: 'auto',
        padding: '72px 60px',
      }}
    >
      <Group direction="column" align={'center'} spacing={0}>
        {loading ? (
          <>
            <LogoLoadingSvg />
            <Text sx={{ fontSize: 24 }} mt={36} weight={'bold'} type="gradient">
              Boarding...
            </Text>
            <Text mt={16} align="center">
              Getting you on board the Voyage. This may take a minute or two so
              keep this window opened!
            </Text>
          </>
        ) : errorMsg ? (
          <>
            <Text sx={{ fontSize: 24 }} mt={36} weight={'bold'}>
              Oops, we got error..
            </Text>
            <Text mt={16} align="center" type="danger">
              {errorMsg}
            </Text>
            <Button mt={16} onClick={finishLogin}>
              Retry
            </Button>
          </>
        ) : (
          <Text sx={{ fontSize: 24 }} mt={36} weight={'bold'} type="gradient">
            Boarded
          </Text>
        )}
      </Group>
    </Card>
  );
};

export default BoardingState;
