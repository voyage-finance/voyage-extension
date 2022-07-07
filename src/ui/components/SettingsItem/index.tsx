import styles from './index.module.scss';
import { PropsWithChildren, ReactElement } from 'react';

interface Props {
  iconLeft: ReactElement;
  iconRight?: ReactElement;
  handleClick: () => void;
}

const Index = ({
  children,
  iconLeft,
  iconRight,
  handleClick,
}: PropsWithChildren<Props>) => {
  return (
    <div className={styles.root} onClick={handleClick}>
      <div className={styles.sectionLeft}>
        <div className={styles.icon}>{iconLeft}</div>
        {children}
      </div>
      {iconRight && <div className={styles.sectionRight}>{iconRight}</div>}
    </div>
  );
};

export default Index;
