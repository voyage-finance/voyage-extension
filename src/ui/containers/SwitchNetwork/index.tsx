import { Text } from '@mantine/core';
import SettingsItem from '@components/SettingsItem';
import styles from './index.module.scss';
import { ReactElement } from 'react';
import { Chain, useNetwork, useSwitchNetwork } from 'wagmi';
import { ReactComponent as ChevronLeft } from '@images/chevron-left-icon.svg';
import { useNavigate } from 'react-router-dom';

interface Network extends Chain {
  icon: ReactElement;
}

interface Props {
  networks: Network[];
}

const SwitchNetwork = (props: Props) => {
  const { networks } = props;
  const { chain } = useNetwork();
  const { switchNetworkAsync: switchNetwork } = useSwitchNetwork();
  const navigate = useNavigate();
  const handleSwitchNetwork = async (chainId: number) => {
    if (chainId === chain?.id) return;
    await switchNetwork!(chainId);
  };
  return (
    <div className={styles.root}>
      <div className={styles.itemWrapper}>
        <SettingsItem
          iconLeft={<ChevronLeft />}
          handleClick={() => navigate(-1)}
        >
          <Text className={styles.copy} weight={700}>
            Back
          </Text>
        </SettingsItem>
      </div>
      <div className={styles.divider}>
        <Text className={styles.copy} weight={700}>
          Select a Supported Network
        </Text>
      </div>
      <div className={styles.itemWrapper}>
        {networks.map((network) => {
          return (
            <SettingsItem
              iconLeft={network.icon}
              handleClick={() => handleSwitchNetwork(network.id)}
            >
              <div className={styles.network}>
                <Text className={styles.copy} weight={700}>
                  {network.name}
                </Text>
                {chain?.id === network.id && (
                  <div className={styles.status}>
                    <div className={styles.indicator} />
                    <Text className={styles.connectedText}>Connected</Text>
                  </div>
                )}
              </div>
            </SettingsItem>
          );
        })}
      </div>
    </div>
  );
};

export default SwitchNetwork;
