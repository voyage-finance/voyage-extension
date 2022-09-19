import * as React from 'react';
import styles from './index.module.scss';
import Text from '@components/Text';
import { Group, GroupProps } from '@mantine/core';
import { ReactComponent as ArrowSvg } from 'assets/img/arrow-top-right-gradient.svg';

interface ILinkProps extends GroupProps {
  link: string;
  text: string;
}

const Link: React.FunctionComponent<ILinkProps> = ({
  text,
  link,
  ...props
}) => {
  return (
    <Group spacing={0} {...props}>
      <a href={link} className={styles.link} target="_blank">
        <Text
          size="lg"
          type="gradient"
          weight="bold"
          sx={{ ':hover': { cursor: 'pointer' } }}
        >
          {text}
        </Text>
      </a>
      <ArrowSvg />
    </Group>
  );
};

export default Link;
