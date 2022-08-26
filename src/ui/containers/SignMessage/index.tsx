import Button from '@components/Button';
import useVoyageController from '@hooks/useVoyageController';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@hooks/useRedux';
import VoyagePaper from '@components/Card';
import { Avatar, Box, Group, Title } from '@mantine/core';
import styles from './index.module.scss';
import { SignRequest } from 'types';
import Text from '@components/Text';

function SignMessage() {
  const voyageController = useVoyageController();
  const { signRequestId } = useParams();
  const pendingSignRequests = useAppSelector(
    (state) => state.core.pendingSignRequests
  );
  const pendingSignRequest: SignRequest = pendingSignRequests[signRequestId!];
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      await voyageController.approveSignRequest(id);
      navigate('/home');
    } catch {
      console.error('failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setLoading(true);
      await voyageController.rejectSignRequest(id);
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
    >
      <Group align="center" spacing={11}>
        <Title className={styles.title} order={1}>
          Signature Request
        </Title>
        <span className={styles.line} />
      </Group>
      <Group direction="column" spacing={10} mt={15}>
        <Text type="secondary">Origin</Text>
        <VoyagePaper px={25} py={17} sx={{ width: 310 }}>
          <Group direction="column" spacing={10}>
            <Group align="center" spacing={5}>
              <Avatar src={pendingSignRequest?.metadata.icons[0]} size={25} />
              <Title order={3} color="white" className={styles.name}>
                {pendingSignRequest?.metadata.name}
              </Title>
            </Group>
            <Text>{pendingSignRequest?.metadata.url}</Text>
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
          {pendingSignRequest.message}
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
