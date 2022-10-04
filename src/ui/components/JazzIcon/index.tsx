import { ethers } from 'ethers';
import jazzicon from 'jazzicon';
import { useEffect, useRef } from 'react';
import styles from './index.module.scss';

// takes the first 4 bytes of the address and generates the seed
function parseAddress(address: string): number {
  return parseInt(address.slice(0, 10), 16);
}

interface Props {
  address?: string;
  diameter?: number;
}

const JazzIcon: React.FC<Props> = ({ address, diameter = 32 }) => {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const icon = jazzicon(
      diameter,
      parseAddress(address ?? ethers.utils.hexlify(ethers.utils.randomBytes(8)))
    );
    container.current?.appendChild(icon); // remove icon
    return () => {
      while (container.current?.firstChild) {
        container.current?.firstChild.remove();
      }
    };
  }, [address, diameter]);

  return <div className={styles.jazzIcon} ref={container} />;
};

export default JazzIcon;
