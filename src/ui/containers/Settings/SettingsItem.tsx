import { Text } from '@mantine/core';
import styles from './SettingsItem.module.scss';
import { FC } from 'react';

interface Props {
  title: string;
  iconLeft: FC<any>;
  iconRight?: FC<any>;
  handleClick: () => void;
}

const SettingsItem = ({
  title,
  iconLeft: IconLeft,
  iconRight: IconRight,
  handleClick,
}: Props) => {
  return (
    <div className={styles.root} onClick={handleClick}>
      <div className={styles.sectionLeft}>
        <IconLeft className={styles.icon} />
        <Text className={styles.copy} weight={700}>
          {title}
        </Text>
      </div>
      {IconRight && (
        <div className={styles.sectionRight}>
          <IconRight className={styles.icon} />
        </div>
      )}
    </div>
  );
};

export default SettingsItem;
