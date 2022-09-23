import * as React from 'react';
import styles from './index.module.scss';
import Text from '@components/Text';
import { Group, GroupProps, TextProps } from '@mantine/core';
import { ReactComponent as ArrowSvg } from 'assets/img/arrow-top-right-gradient.svg';

interface ILinkProps extends GroupProps {
  link: string;
  text: string;
  size?: TextProps<any>['size'];
}

const Link: React.FunctionComponent<ILinkProps> = ({
  text,
  link,
  size = 'lg',
  ...props
}) => {
  return (
    <Group spacing={0} {...props}>
      <a href={link} className={styles.link} target="_blank">
        <Text
          size={size}
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
