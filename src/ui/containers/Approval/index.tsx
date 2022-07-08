import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '@hooks/useRedux';
import WalletConnectApproval from '@containers/Approval/WalletConnect';

const Approval: React.FC = () => {
  const { approvalId } = useParams();
  const approval = useAppSelector((state) => {
    return state.core.pendingApprovals[approvalId as string];
  });
  switch (approval?.type) {
    case 'wc':
    default:
      return <WalletConnectApproval />;
  }
};

export default Approval;
