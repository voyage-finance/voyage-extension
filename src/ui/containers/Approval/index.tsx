import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '@hooks/useRedux';
import WalletConnectApproval from '@containers/Approval/WalletConnect';
import { ApprovalType } from 'types';
import SignMessage from '@containers/SignMessage';
import MarketplaceApproval from '@containers/MarketplaceApproval';

const Approval: React.FC = () => {
  const { approvalId } = useParams();
  const approval = useAppSelector((state) => {
    return state.core.pendingApprovals[approvalId as string];
  });
  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      {(() => {
        switch (approval?.type) {
          case ApprovalType.SIGN_MESSAGE:
            return <SignMessage />;
          case ApprovalType.APPROVE_MARKETPLACE:
            return <MarketplaceApproval />;
          case ApprovalType.WALLET_CONNECT:
          default:
            return <WalletConnectApproval />;
        }
      })()}
    </div>
  );
};

export default Approval;
