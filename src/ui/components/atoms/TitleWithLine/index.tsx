import { Group, GroupProps, Title } from '@mantine/core';
import * as React from 'react';
import styles from './index.module.scss';
import cn from 'classnames';

interface IProps extends GroupProps {
  size?: 'lg' | 'md';
}

const TitleWithLine: React.FunctionComponent<IProps> = ({
  size = 'lg',
  ...props
}) => {
  return (
    <Group align="center" spacing={11} {...props}>
      <Title className={cn(styles.title, size == 'md' && styles.md)}>
        {props.children}
      </Title>
      <span className={styles.line} />
    </Group>
  );
};

export default TitleWithLine;
