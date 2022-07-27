import * as React from 'react';
import { Box, Group } from '@mantine/core';
import Card from '@components/Card';
import Text from '@components/Text';
import { ReactComponent as EnvelopeSvg } from 'assets/img/envelope.svg';

const CheckEmailStep: React.FC = () => {
  return (
    <Card
      style={{
        width: 420,
        margin: 'auto',
        padding: '72px 60px',
      }}
    >
      <Group direction="column" align={'center'} spacing={0}>
        <EnvelopeSvg />
        <Text sx={{ fontSize: 24 }} mt={38} weight={'bold'} type="gradient">
          Check Yar Mail!
        </Text>
        <Text mt={17}>Click on the magic link we’ve sent to</Text>
        <Text mt={35} type="gradient">
          supermanbatmanspiderman@gmail.com
        </Text>
        <Text weight={'bold'} mt={37}>
          Your Session Emojis
        </Text>
        <Text align="center" mt={18}>
          We want you to be safe on your voyage, so make sure the session emojis
          in your mail line up with these guys below:
        </Text>
        <Group spacing={10} mt={32} sx={{ fontSize: 25 }}>
          <Box>😀</Box>
          <Box>😇</Box>
          <Box>😭</Box>
          <Box>😤</Box>
          <Box>👦🏻</Box>
        </Group>
      </Group>
    </Card>
  );
};

export default CheckEmailStep;
