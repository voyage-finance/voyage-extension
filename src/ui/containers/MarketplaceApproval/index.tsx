import Button from '@components/Button';
import useVoyageController from '@hooks/useVoyageController';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@hooks/useRedux';
import VoyagePaper from '@components/Card';
import { Avatar, Box, Group, Stack, Title } from '@mantine/core';
import styles from './index.module.scss';
import Text from '@components/Text';
import Link from '@components/Link';
import { getShortenedAddress, getTxExplorerLink } from '@utils/env';
import { ReactComponent as CopySvg } from 'assets/img/copy-icon.svg';
import { ApprovalRequest } from 'types';
import TitleWithLine from '@components/atoms/TitleWithLine';

function MarketplaceApproval() {
  const voyageController = useVoyageController();
  const { approvalId } = useParams();
  const pendingSignRequests = useAppSelector(
    (state) => state.core.pendingApprovals
  );
  const pendingSignRequest: ApprovalRequest = pendingSignRequests[approvalId!];
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      await voyageController.approveApprovalRequest(id);
      navigate('/');
    } catch {
      console.error('failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setLoading(true);
      await voyageController.rejectApprovalRequest(id);
    } catch {
      console.error('failed to reject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Group
      direction="column"
      align="stretch"
      className={styles.root}
      spacing={0}
      noWrap
    >
      <TitleWithLine>Approval Request</TitleWithLine>
      <Group direction="column" spacing={10} mt={15}>
        <Text type="secondary">Origin</Text>
        <VoyagePaper px={25} py={17} sx={{ width: 310 }}>
          <Group direction="column" spacing={10}>
            <Group align="center" spacing={5}>
              <Avatar src={pendingSignRequest?.client.icons[0]} size={25} />
              <Title order={3} color="white" className={styles.name}>
                {pendingSignRequest?.client.name}
              </Title>
            </Group>
            <Text>{pendingSignRequest?.client.url}</Text>
          </Group>
        </VoyagePaper>
      </Group>
      <Group direction="column" sx={{ flexGrow: 1 }} spacing={10} mt={10}>
        <Text type="secondary">Permission Requested</Text>
        <VoyagePaper
          px={22}
          py={20}
          className={styles.messageBox}
          sx={{ width: 310, flexGrow: 1, maxHeight: 210 }}
        >
          <Stack spacing={10}>
            {/* TODO: wETH should be dynamic */}
            <Text weight="bold" size="lg">
              Give permission to access your wETH
            </Text>
            <Text>
              By granting permission, you are allowing the following contract to
              access your funds:
            </Text>
            <Link
              link={getTxExplorerLink(pendingSignRequest.metadata.calldata)}
              text={getShortenedAddress(pendingSignRequest.metadata.calldata)}
            />
          </Stack>
        </VoyagePaper>
      </Group>
      <Group direction="column" sx={{ flexGrow: 1 }} spacing={10} mt={10}>
        <Text type="secondary">Data</Text>
        <VoyagePaper
          px={22}
          py={20}
          className={styles.messageBox}
          sx={{ width: 310, flexGrow: 1, maxHeight: 210 }}
        >
          <Stack spacing={10}>
            {/* TODO: function name should be decoded from calldata */}
            <Text weight="bold" size="lg">
              Function: Approve
            </Text>
            <Text>
              {getShortenedAddress(pendingSignRequest.metadata.calldata)}{' '}
              <CopySvg />
            </Text>
          </Stack>
        </VoyagePaper>
      </Group>
      <Box my={16} className={styles.buttons}>
        <Button
          className={styles.reject}
          onClick={() => handleReject(pendingSignRequest.id)}
          loading={loading}
          disabled={loading}
          variant="outline"
        >
          Reject
        </Button>
        <Button
          loading={loading}
          className={styles.accept}
          disabled={loading}
          onClick={() => handleApprove(pendingSignRequest.id)}
        >
          Confirm
        </Button>
      </Box>
    </Group>
  );
}

export default MarketplaceApproval;
