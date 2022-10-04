import Button from '@components/Button';
import useVoyageController from '@hooks/useVoyageController';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@hooks/useRedux';
import VoyagePaper from '@components/Card';
import { Text, Title } from '@mantine/core';
import { ReactComponent as CircleCheck } from '@images/circle-check-icon.svg';
import styles from './WalletConnect.module.scss';
import { ApprovalRequest } from 'types';
import { useBeforeunload } from 'react-beforeunload';

function WalletConnectApproval() {
  const voyageController = useVoyageController();
  const { approvalId } = useParams();
  const pendingApprovals = useAppSelector(
    (state) => state.core.pendingApprovals
  );
  const pendingApproval: ApprovalRequest = pendingApprovals[approvalId!];
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleApproveSession = async (id: string) => {
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
  const handleRejectSession = async (id: string) => {
    try {
      setLoading(true);
      await voyageController.rejectApprovalRequest(id);
    } catch {
      console.error('failed to reject');
    } finally {
      setLoading(false);
    }
  };

  useBeforeunload(() => {
    voyageController.rejectApprovalRequest(approvalId!);
  });

  return (
    <div className={styles.root}>
      <VoyagePaper className={styles.paper}>
        <div className={styles.wrapper}>
          <Title className={styles.title} order={1}>
            Confirm Connection
          </Title>
          <Text size="md" color="white" style={{ padding: '0 4px' }}>
            <strong>WalletConnect</strong> wants to connect to your Voyage
            vault.
          </Text>
          <VoyagePaper className={styles.uri}>
            <Text className={styles.text} size="md" color="white">
              {pendingApproval?.client.url}
            </Text>
          </VoyagePaper>
          <div className={styles.permissions}>
            <Text
              size="md"
              color="white"
              weight="bold"
              sx={{ marginBottom: 16 }}
            >
              Permissions Required:
            </Text>
            <div className={styles.items}>
              <div className={styles.item}>
                <CircleCheck className={styles.icon} />
                <Text size="md" color="white">
                  View your wallet balance and activity
                </Text>
              </div>
              <div className={styles.item}>
                <CircleCheck className={styles.icon} />
                <Text size="md" color="white">
                  Request your approval for transactions
                </Text>
              </div>
              <div className={styles.item}>
                <CircleCheck className={styles.icon} />
                <Text size="md" color="white">
                  Sign messages
                </Text>
              </div>
            </div>
          </div>
        </div>
      </VoyagePaper>
      <div className={styles.buttons}>
        <Button
          className={styles.reject}
          onClick={() => handleRejectSession(pendingApproval.id)}
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
          onClick={() => handleApproveSession(pendingApproval.id)}
        >
          Connect
        </Button>
      </div>
    </div>
  );
}

export default WalletConnectApproval;
