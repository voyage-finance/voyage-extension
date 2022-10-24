import { Group, GroupProps, Title } from '@mantine/core';
import * as React from 'react';
import styles from './index.module.scss';
import cn from 'classnames';
import { X } from 'tabler-icons-react';
import { useNavigate } from 'react-router-dom';

interface IProps extends GroupProps {
  size?: 'lg' | 'md';
  showClose?: boolean;
  onClose?: () => void;
}

const TitleWithLine: React.FunctionComponent<IProps> = ({
  size = 'lg',
  showClose,
  onClose,
  ...props
}) => {
  const navigate = useNavigate();
  return (
    <Group align="center" spacing={11} {...props}>
      <Title className={cn(styles.title, size == 'md' && styles.md)}>
        {props.children}
      </Title>
      <span className={styles.line} />
      {showClose && (
        <div
          onClick={() => {
            onClose ? onClose() : navigate(-1);
          }}
          className={styles.closeBtn}
        >
          <X />
        </div>
      )}
    </Group>
  );
};

export default TitleWithLine;
