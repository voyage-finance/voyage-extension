import TitleWithLine from '@components/atoms/TitleWithLine';
import Button from '@components/Button';
import VoyagePaper from '@components/Card';
import Text from '@components/Text';
import { useAppSelector } from '@hooks/useRedux';
import useVoyageController from '@hooks/useVoyageController';
import { Avatar, Box, Group, Title } from '@mantine/core';
import { closeNotificationWindow } from '@utils/extension';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApprovalRequest } from 'types';
import styles from './index.module.scss';

function SignMessage() {
  const voyageController = useVoyageController();
  const { approvalId } = useParams();
  const pendingSignRequests = useAppSelector(
    (state) => state.core.pendingApprovals
  );
  const pendingSignRequest: ApprovalRequest = pendingSignRequests[approvalId!];
  const [loading, setLoading] = useState(false);

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      await voyageController.approveApprovalRequest(id);
      closeNotificationWindow();
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
      closeNotificationWindow();
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
      <TitleWithLine>Signature Request</TitleWithLine>
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
        <Text type="secondary">Message</Text>
        <VoyagePaper
          px={22}
          py={20}
          className={styles.messageBox}
          sx={{ width: 310, flexGrow: 1, maxHeight: 210 }}
        >
          {pendingSignRequest.metadata.message}
        </VoyagePaper>
      </Group>
      <Box mt={16} className={styles.buttons}>
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
          Sign
        </Button>
      </Box>
    </Group>
  );
}

export default SignMessage;
