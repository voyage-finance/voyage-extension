import Button from '@components/Button';
import useVoyageController from '@hooks/useVoyageController';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@hooks/useRedux';
import VoyagePaper from '@components/Card';
import { Text, Title } from '@mantine/core';
import styles from './index.module.scss';
import { SignRequest } from 'types';

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
    <div className={styles.root}>
      <VoyagePaper className={styles.paper}>
        <div className={styles.wrapper}>
          <Title className={styles.title} order={1}>
            Sign Message
          </Title>
          <VoyagePaper className={styles.uri}>
            <Text className={styles.text} size="md" color="white">
              {pendingSignRequest?.address}
            </Text>
          </VoyagePaper>
          <div className={styles.permissions}>
            <Text
              size="md"
              color="white"
              weight="bold"
              sx={{ marginBottom: 16 }}
            >
              You are signing:
            </Text>
            <div className={styles.items}>
              <Text size="md" color="white">
                {pendingSignRequest.message}
              </Text>
            </div>
          </div>
        </div>
      </VoyagePaper>
      <div className={styles.buttons}>
        <Button
          className={styles.reject}
          onClick={() => handleReject(pendingSignRequest.id)}
          loading={loading}
          disabled={loading}
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          loading={loading}
          className={styles.accept}
          disabled={loading}
          onClick={() => handleApprove(pendingSignRequest.id)}
        >
          Sign
        </Button>
      </div>
    </div>
  );
}

export default SignMessage;
