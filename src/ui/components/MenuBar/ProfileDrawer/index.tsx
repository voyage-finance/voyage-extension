import { useState } from 'react';
import { Drawer, Group, Image, Loader, Stack } from '@mantine/core';
import cn from 'classnames';
import styles from './index.module.scss';
import { ReactComponent as ArrowRightGradient } from '@images/arrow-right-gradient.svg';
import { ReactComponent as ArrowRightSvg } from '@images/arrow-right.svg';
import { ReactComponent as CopyDefault } from 'assets/img/copy-gray.svg';
import { ReactComponent as CopyGradient } from 'assets/img/copy-gradient.svg';
import { ReactComponent as ScanDefault } from 'assets/img/scan-gray.svg';
import { ReactComponent as ScanGradient } from 'assets/img/scan-gradient.svg';
import { ReactComponent as TopUpIcon } from 'assets/img/topup-icon.svg';
import { ReactComponent as SendIcon } from 'assets/img/send-icon.svg';
import PepePlacholderImg from '@images/pepe-placeholder.png';
import Text from '@components/Text';
import { formatAmount } from '@utils/bn';
import { useTotalBalance } from '@hooks/useTotalBalance';
import { ReactComponent as WEthSvg } from 'assets/img/weth.svg';
import CopyTooltip from '@components/atoms/CopyTooltip';
import { chains } from '@utils/chain';
import { useNetwork } from 'wagmi';
import { useAppSelector } from '@hooks/useRedux';
import Button from '@components/Button';
import { ArrowUpRight } from 'tabler-icons-react';
import QrCode from '@components/QrCode';
import { getShortenedAddress } from '@utils/env';
import { useNavigate } from 'react-router-dom';

const ProfileDrawer: React.FunctionComponent<{
  opened: boolean;
  onClose: () => void;
}> = ({ opened, onClose }) => {
  const address = useAppSelector((state) => state.core.vaultAddress);
  const { chain } = useNetwork();
  const isSupportedChain = chains.some(({ id }) => id === chain?.id);
  const [balance, balanceLoading] = useTotalBalance(address);
  const [copied, setCopied] = useState(false);

  const [qrOpened, setQrOpened] = useState(false);

  const onClickHandler = async () => {
    await navigator.clipboard.writeText(address ?? '');
    setCopied(true);
  };

  const navigate = useNavigate();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      classNames={{
        drawer: styles.drawerRoot,
      }}
      withCloseButton={false}
      position="right"
    >
      <Stack>
        <div className={styles.profileHeader}>
          <Stack className={styles.connectionInfo} align="center" spacing={0}>
            <Text size="sm" color="gray">
              Network Connection
            </Text>
            <div className={styles.network}>
              <div
                className={cn(
                  styles.status,
                  isSupportedChain ? styles.ok : styles.bad
                )}
              />
              <div className={styles.name}>
                {isSupportedChain ? chain?.name : 'Network Not Supported'}
              </div>
            </div>
          </Stack>
          <div className={styles.closeBtn} onClick={onClose}>
            <ArrowRightSvg className={styles.arrowIconDefault} />
            <ArrowRightGradient className={styles.arrowIconGradient} />
          </div>
        </div>
        <Group spacing={11} align="start">
          <Stack align="end" spacing={0} sx={{ flex: 1 }}>
            <Text size="sm" type="secondary">
              Address
            </Text>
            <Group spacing={1}>
              <CopyTooltip copied={copied}>
                <div
                  className={styles.address}
                  onClick={onClickHandler}
                  onMouseLeave={() => setCopied(false)}
                >
                  <Text weight="bold">{getShortenedAddress(address)}</Text>
                  <CopyDefault className={styles.copyIcon} />
                  <CopyGradient className={styles.copyIconGradient} />
                </div>
              </CopyTooltip>
              <div className={styles.scanBtn} onClick={() => setQrOpened(true)}>
                <ScanDefault className={styles.scanIcon} />
                <ScanGradient className={styles.scanIconGradient} />
              </div>
            </Group>
            <Group direction="column" align="end" spacing={0}>
              <Text size="sm" type="secondary">
                wETH Balance
              </Text>
              <Group align="center" spacing={2}>
                <Text sx={{ fontSize: 24 }} weight={'bold'} inline>
                  {balanceLoading ? (
                    <Loader size={14} />
                  ) : (
                    formatAmount(balance)
                  )}
                </Text>
                <WEthSvg />
              </Group>
            </Group>
          </Stack>
          <Image
            width={87}
            height={87}
            fit="contain"
            radius={10}
            src={PepePlacholderImg}
            alt="image"
          />
        </Group>
        <Group>
          <Button
            size="l"
            tabIndex={-1}
            style={{ flex: 1, borderRadius: 10, height: 40 }}
            onClick={() => {
              navigate('/vault/topup/method');
              onClose();
            }}
          >
            Top-Up
            <TopUpIcon />
          </Button>
          <Button
            size="l"
            kind="secondary"
            tabIndex={-1}
            style={{ flex: 1, borderRadius: 10, height: 40 }}
            onClick={() => {
              navigate('/send');
              onClose();
            }}
          >
            Send
            <SendIcon />
          </Button>
        </Group>
        <Text className={styles.latestTitle} ml="auto">
          Latest Activities
        </Text>
        <Group className={styles.activityCard} spacing={0}>
          <div className={styles.activityCardIcon}>
            <TopUpIcon />
          </div>
          <Stack spacing={0} ml={8}>
            <Text weight="bold">Top-Up</Text>
            <Text size="sm">
              <span className={styles.date}>Jul 20</span> - 0x9sdf...68scq
            </Text>
          </Stack>
          <ArrowUpRight className={styles.arrowIcon} />
        </Group>
      </Stack>
      <Drawer
        classNames={{
          drawer: styles.qrCodeDrawer,
        }}
        opened={qrOpened}
        onClose={() => setQrOpened(false)}
        size="full"
        position="bottom"
      >
        <Stack
          spacing={0}
          className={styles.content}
          justify="center"
          align="center"
        >
          <QrCode address={address!} />
          <Text className={styles.address}>{getShortenedAddress(address)}</Text>
        </Stack>
      </Drawer>
    </Drawer>
  );
};

export default ProfileDrawer;
