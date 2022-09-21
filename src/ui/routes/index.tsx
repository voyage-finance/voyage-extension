import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Connect from '@containers/Connect';
import styles from './index.module.scss';
import Approval from '@containers/Approval';
import Home from '@containers/Home';
import MenuBar from '@components/MenuBar/MenuBar';
import Settings from '@containers/Settings';
import SwitchNetwork from '@containers/SwitchNetwork';
import { networks } from '@utils/chain';
import Connections from '@containers/Connections';
import EnterEmailStep from '@containers/Onboard/EnterEmail';
import { useEffect, useState } from 'react';
import cn from 'classnames';
import BoardingState from '@containers/Onboard/BoardingState';
import CheckEmailStep from '@containers/Onboard/CheckEmail';
import { useAppSelector } from '@hooks/useRedux';
import Onboard from '@containers/FullscreenContainer';
import { KeyStoreStage } from 'types';
import SignTermsStep from '@containers/Onboard/SignTermsState';
import SelectDepositMethod from '@containers/VaultDeploy/SelectDepositMethod';
import AwaitDeposit from '@containers/VaultDeploy/AwaitDeposit';
import VaultDeployed from '@containers/VaultDeploy/Deployed';
import { ethers } from 'ethers';
import useVoyageController from '@hooks/useVoyageController';
import {
  DEFAULT_ROUTE,
  ONBOARD_CHECK_EMAIL_ROUTE,
  ONBOARD_INITIALIZING_ROUTE,
  ONBOARD_LOGIN_ROUTE,
  ONBOARD_TERMS_ROUTE,
  PURCHASE_OVERVIEW_ROUTE,
  APPROVAL_ROUTE,
  VAULT_DEPOSIT_DEPLOYED_ROUTE,
  VAULT_DEPOSIT_METHODS_ROUTE,
} from '@utils/constants';
import { ExtensionEnvType, getEnvironmentType } from '@utils/extension';
import PurchaseCart from '@containers/PurchaseCart';
import PurchaseConfirmed from '@containers/PurchaseConfirmed';
import NavigationBar from '@components/NavigationBar';

const Router: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const controller = useVoyageController();

  const isFullscreenMode =
    location.pathname.startsWith('/onboard') ||
    location.pathname.startsWith(PURCHASE_OVERVIEW_ROUTE) ||
    location.pathname.startsWith('/vault/deposit');

  const stage = useAppSelector((state) => state.core.stage);
  const isTermsSigned = useAppSelector((state) => state.core.isTermsSigned);
  const vault = useAppSelector((state) => state.core.vaultAddress);
  const pendingApprovalRequests = useAppSelector((state) => {
    return Object.values(state.core.pendingApprovals);
  });

  const [waitingDeploy, setWaitingDeploy] = useState(false);

  const resetStorage = () => {
    controller.cancelLogin();
  };

  const checkStatusAndNavigate = async () => {
    const [unconfirmedTx] = await controller.getUnconfirmedTransactions();
    const [pendingApprovalRequest] = pendingApprovalRequests;
    const isNotification =
      getEnvironmentType() === ExtensionEnvType.Notification;
    const isTab = getEnvironmentType() === ExtensionEnvType.Fullscreen;
    if (isNotification && pendingApprovalRequest) {
      navigate(`${APPROVAL_ROUTE}/${pendingApprovalRequest.id}`);
    } else if (isTab && unconfirmedTx) {
      navigate(`${PURCHASE_OVERVIEW_ROUTE}/${unconfirmedTx.id}`);
    } else {
      navigate(DEFAULT_ROUTE);
    }
  };

  useEffect(() => {
    console.log('🚀 ~ file: index.tsx ~ line 82 ~ useEffect ~ stage', stage);
    // navigate(`${PURCHASE_OVERVIEW_ROUTE}/1`);
    // return;
    switch (stage) {
      case KeyStoreStage.WaitingConfirm:
        navigate(ONBOARD_CHECK_EMAIL_ROUTE);
        break;
      case KeyStoreStage.Initializing:
        navigate(ONBOARD_INITIALIZING_ROUTE);
        break;
      case KeyStoreStage.Uninitialized:
        navigate(ONBOARD_LOGIN_ROUTE);
        break;
      case KeyStoreStage.Initialized:
        if (vault && vault !== ethers.constants.AddressZero) {
          waitingDeploy
            ? navigate(VAULT_DEPOSIT_DEPLOYED_ROUTE)
            : checkStatusAndNavigate();
          setWaitingDeploy(false);
        } else {
          if (isTermsSigned) {
            navigate(VAULT_DEPOSIT_METHODS_ROUTE);
          } else {
            navigate(ONBOARD_TERMS_ROUTE);
            setWaitingDeploy(true);
          }
        }
        break;
    }
  }, [stage, isTermsSigned, vault]);

  return (
    <div className={cn(styles.root, isFullscreenMode && styles.tabView)}>
      {!isFullscreenMode && <MenuBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/settings/network"
          element={<SwitchNetwork networks={networks} />}
        />
        <Route path="/connect" element={<Connect />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/approval/:approvalId" element={<Approval />} />
        <Route path={PURCHASE_OVERVIEW_ROUTE} element={<Onboard />}>
          <Route path=":txId" element={<PurchaseCart />} />
          <Route path="confirmed/:txId" element={<PurchaseConfirmed />} />
        </Route>
        <Route path="/onboard/" element={<Onboard />}>
          <Route path="login" element={<EnterEmailStep />} />
          <Route path="boarding" element={<BoardingState />} />
          <Route path="checkemail" element={<CheckEmailStep />} />
          <Route path="terms" element={<SignTermsStep />} />
        </Route>
        <Route path="/vault/" element={<Onboard />}>
          <Route path="deposit/method" element={<SelectDepositMethod />} />
          <Route path="deposit/await" element={<AwaitDeposit />} />
          <Route path="deposit/deployed" element={<VaultDeployed />} />
        </Route>
      </Routes>
      <NavigationBar />
      {process.env.VOYAGE_DEBUG && (
        <div
          style={{ color: 'rgba(255, 255, 255, 0.1)' }}
          onClick={resetStorage}
        >
          Clear storage
        </div>
      )}
    </div>
  );
};

export default Router;
