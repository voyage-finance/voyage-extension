import Card from '@components/Card';
import Text from '@components/Text';
import { Group } from '@mantine/core';
import * as React from 'react';
import { ReactComponent as ScrollPaperSvg } from 'assets/img/scroll-paper.svg';
import Button from '@components/Button';
import useVoyageController from '@hooks/useVoyageController';

const SignTermsStep: React.FC = () => {
  const controller = useVoyageController();

  const onAgree = () => {
    controller.setTermsAgreed();
  };

  return (
    <Card
      style={{
        width: 420,
        margin: 'auto',
        padding: '72px 30px',
      }}
    >
      <Group direction="column" align={'center'} spacing={0}>
        <ScrollPaperSvg />
        <Text sx={{ fontSize: 24 }} mt={36} weight={'bold'} type="gradient">
          Voyage’s Terms and Conditions
        </Text>
        <Text mt={16} align="center">
          You’re almost there! Before you step foot on Voyage, read through our{' '}
          <Text component="span" type="accent" weight="bold" underline>
            Terms and Conditions
          </Text>{' '}
          and click <strong>“I Agree”</strong>.
        </Text>
        <Button mt={36} sx={{ width: 300 }} onClick={onAgree}>
          I Agree
        </Button>
      </Group>
    </Card>
  );
};

export default SignTermsStep;
