import MenuBar from '@components/MenuBar/MenuBar';
import Approval from '@containers/Approval';
import Connect from '@containers/Connect';
import Connections from '@containers/Connections';
import Onboard from '@containers/FullscreenContainer';
import Home from '@containers/Home';
import BoardingState from '@containers/Onboard/BoardingState';
import CheckEmailStep from '@containers/Onboard/CheckEmail';
import EnterEmailStep from '@containers/Onboard/EnterEmail';
import SignTermsStep from '@containers/Onboard/SignTermsState';
import PurchaseCart from '@containers/PurchaseCart';
import PurchaseConfirmed from '@containers/PurchaseConfirmed';
import Settings from '@containers/Settings';
import DirectTopUp from '@containers/TopUp/DirectTopUp';
import SelectTopUpMethod from '@containers/TopUp/SelectTopUpMethod';
import AwaitDeposit from '@containers/VaultDeploy/AwaitDeposit';
import VaultDeployed from '@containers/VaultDeploy/Deployed';
import SelectDepositMethod from '@containers/VaultDeploy/SelectDepositMethod';
import { useAppSelector } from '@hooks/useRedux';
import useVoyageController from '@hooks/useVoyageController';
import {
  APPROVAL_ROUTE,
  DEFAULT_ROUTE,
  ONBOARD_CHECK_EMAIL_ROUTE,
  ONBOARD_INITIALIZING_ROUTE,
  ONBOARD_LOGIN_ROUTE,
  ONBOARD_TERMS_ROUTE,
  PURCHASE_OVERVIEW_ROUTE,
  VAULT_DEPOSIT_DEPLOYED_ROUTE,
  VAULT_DEPOSIT_METHODS_ROUTE,
} from '@utils/constants';
import { config } from '@utils/env';
import { ExtensionEnvType, getEnvironmentType } from '@utils/extension';
import cn from 'classnames';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { KeyStoreStage } from 'types';
import styles from './index.module.scss';
import NavigationBar from '@components/NavigationBar';
import { LoadingOverlay } from '@mantine/core';
import LoanListPage from 'ui/pages/loans';
import LoanItemPage from 'ui/pages/loanItem';
import CollectionsPage from 'ui/pages/collections';
import SendPage from 'ui/pages/send';
import VaultDeployError from '@containers/VaultDeploy/DeployError';

const Router: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const controller = useVoyageController();

  const isNotification = getEnvironmentType() === ExtensionEnvType.Notification;
  const isFullscreenMode =
    location.pathname.startsWith('/onboard') ||
    location.pathname.startsWith(PURCHASE_OVERVIEW_ROUTE) ||
    location.pathname.startsWith('/vault/deposit');
  const showNavigation = !isNotification && !isFullscreenMode;

  const stage = useAppSelector((state) => state.core.stage);
  const isTermsSigned = useAppSelector((state) => state.core.isTermsSigned);
  const vault = useAppSelector((state) => state.core.vaultAddress);
  const pendingApprovalRequests = useAppSelector((state) => {
    return Object.values(state.core.pendingApprovals);
  });

  const [waitingDeploy, setWaitingDeploy] = useState(false);
  const [isVaultLoading, setIsVaultLoading] = useState(false);

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

  const checkForVault = async () => {
    setIsVaultLoading(true);
    await controller.fetchVault();
    setIsVaultLoading(false);
  };

  useEffect(() => {
    console.log('🚀 ~ file: index.tsx ~ line 82 ~ useEffect ~ stage', stage);
    // navigate(`/vault/deposit/await/direct`);
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
          setWaitingDeploy(true);
          if (isTermsSigned) {
            if (!location.pathname.startsWith('/vault/deposit'))
              navigate(VAULT_DEPOSIT_METHODS_ROUTE);
          } else {
            navigate(ONBOARD_TERMS_ROUTE);
          }
        }
        break;
    }
  }, [stage, isTermsSigned, vault]);

  useEffect(() => {
    if (!vault || vault == ethers.constants.AddressZero) checkForVault();
  }, []);

  return (
    <div className={cn(styles.root, isFullscreenMode && styles.tabView)}>
      <LoadingOverlay visible={isVaultLoading} />
      {!isFullscreenMode && <MenuBar />}
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/loans" element={<LoanListPage />} />
        <Route path="/loans/:id" element={<LoanItemPage />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/send" element={<SendPage />} />
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
          <Route path="deposit/await/:method" element={<AwaitDeposit />} />
          <Route path="deposit/deployed" element={<VaultDeployed />} />
          <Route path="deposit/error" element={<VaultDeployError />} />
        </Route>
        <Route path="/vault/">
          <Route path="topup/method" element={<SelectTopUpMethod />} />
          <Route path="topup/direct" element={<DirectTopUp />} />
        </Route>
      </Routes>
      {showNavigation && <NavigationBar />}
      {config.debug && (
        <div className={styles.debugReset} onClick={resetStorage}>
          RESET
        </div>
      )}
    </div>
  );
};

export default Router;
