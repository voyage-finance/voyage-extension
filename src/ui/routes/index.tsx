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
import { useEffect } from 'react';
import cn from 'classnames';
import BoardingState from '@containers/Onboard/BoardingState';
import CheckEmailStep from '@containers/Onboard/CheckEmail';
import { useAppSelector } from '@hooks/useRedux';
import Onboard from '@containers/Onboard';
import { KeyStoreStage } from 'controller/types';
import SignTermsStep from '@containers/Onboard/SignTermsState';
import SelectDepositMethod from '@containers/VaultDeploy/SelectDepositMethod';
import AwaitDeposit from '@containers/VaultDeploy/AwaitDeposit';

const Router: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isOnboardingFlow =
    location.pathname.startsWith('/onboard') ||
    location.pathname.startsWith('/vault/deposit');
  const needToShowMenubar = location.pathname !== '/' && !isOnboardingFlow;

  const stage = useAppSelector((state) => state.core.stage);
  const isTermsSigned = useAppSelector((state) => state.core.isTermsSigned);

  useEffect(() => {
    console.log('[stage, isTermsSigned]', stage, isTermsSigned);
    // navigate('/vault/deposit/method');
    switch (stage) {
      case KeyStoreStage.WaitingConfirm:
        navigate('/onboard/checkemail');
        break;
      case KeyStoreStage.Initializing:
        navigate('/onboard/boarding');
        break;
      case KeyStoreStage.Uninitialized:
        navigate('/onboard/login');
        break;
      case KeyStoreStage.Initialized:
        if (isTermsSigned) {
          navigate('/vault/deposit/method');
        } else navigate('/onboard/terms');
        break;
    }
  }, [stage, isTermsSigned]);

  return (
    <div className={cn(styles.root, isOnboardingFlow && styles.tabView)}>
      {needToShowMenubar && <MenuBar />}
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
        <Route path="/onboard/" element={<Onboard />}>
          <Route path="login" element={<EnterEmailStep />} />
          <Route path="boarding" element={<BoardingState />} />
          <Route path="checkemail" element={<CheckEmailStep />} />
          <Route path="terms" element={<SignTermsStep />} />
        </Route>
        <Route path="/vault/" element={<Onboard />}>
          <Route path="deposit/method" element={<SelectDepositMethod />} />
          <Route path="deposit/await" element={<AwaitDeposit />} />
        </Route>
      </Routes>
    </div>
  );
};

export default Router;
