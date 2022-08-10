import * as React from 'react';
import { Box, Group } from '@mantine/core';
import Card from '@components/Card';
import Text from '@components/Text';
import { ReactComponent as EnvelopeSvg } from 'assets/img/envelope.svg';
import { useAppSelector } from '@hooks/useRedux';
import Button from '@components/Button';
import useVoyageController from '@hooks/useVoyageController';

const CheckEmailStep: React.FC = () => {
  const pendingLogin = useAppSelector((state) => state.core.pendingLogin);
  const controller = useVoyageController();

  const onCancelClick = () => {
    controller.cancelLogin();
  };

  return (
    <Card
      style={{
        width: 420,
        margin: 'auto',
        padding: '55px 60px',
        paddingBottom: 39,
      }}
    >
      <Group direction="column" align={'center'} spacing={0}>
        <EnvelopeSvg />
        <Text sx={{ fontSize: 24 }} mt={24} weight={'bold'} type="gradient">
          Check Yar Mail!
        </Text>
        <Text mt={17}>Click on the magic link we’ve sent to</Text>
        <Box
          sx={{
            borderRadius: 10,
            background: 'rgba(27, 29, 44, 0.6)',
            padding: '17px 25px',
            marginTop: 18,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Text type="gradient">{pendingLogin?.email}</Text>
        </Box>
        <Text weight={'bold'} mt={21}>
          Your Session Emojis
        </Text>
        <Text align="center" mt={18}>
          We want you to be safe on your voyage, so make sure the session emojis
          in your mail line up with these guys below:
        </Text>
        <Group
          spacing={19}
          mt={32}
          position="center"
          noWrap={true}
          sx={{
            borderRadius: 10,
            background: 'rgba(27, 29, 44, 0.6)',
            padding: '5px 25px',
            marginTop: 18,
            width: '100%',
            fontSize: 25,
          }}
        >
          {[...(pendingLogin?.fingerprint || '')].map((emoji, index) => (
            <Box key={index}>{emoji}</Box>
          ))}
        </Group>
        <Button kind="secondary" mt={20} onClick={onCancelClick} fullWidth>
          Cancel
        </Button>
      </Group>
    </Card>
  );
};

export default CheckEmailStep;
