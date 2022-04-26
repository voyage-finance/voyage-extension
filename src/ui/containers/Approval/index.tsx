import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@mantine/core';
import { useAppSelector } from '@hooks/useRedux';
import useVoyageController from '@hooks/useVoyageController';
import { closeNotificationWindow } from '@utils/extension';

const Approval: React.FC = () => {
  const { requestId } = useParams();
  const approval = useAppSelector((state) => {
    return state.core.pendingApprovals[requestId as string];
  });
  const controller = useVoyageController();
  return (
    <div>
      <div>Approval: {JSON.stringify(approval, null, 4)} </div>
      <div>
        <Button
          onClick={() =>
            controller
              .approveApprovalRequest(requestId as string)
              .then(closeNotificationWindow)
          }
        >
          Connect
        </Button>
        <Button
          onClick={() =>
            controller
              .rejectApprovalRequest(requestId as string)
              .then(closeNotificationWindow)
          }
        >
          Reject
        </Button>
      </div>
    </div>
  );
};

export default Approval;
