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

const Router: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isOnboardingFlow = location.pathname.startsWith('/onboard');
  const needToShowMenubar = location.pathname !== '/' && !isOnboardingFlow;

  const isLoggingIn = useAppSelector((state) => state.core.isLoggingIn);
  const isLoggedIn = useAppSelector((state) => state.core.isLoggedIn);

  useEffect(() => {
    console.log('[isLoggingIn, isLoggedIn]', isLoggingIn, isLoggedIn);
    if (isLoggingIn) {
      navigate('/onboard/checkemail');
    } else {
      if (!isLoggedIn) {
        navigate('/onboard/login');
      } else {
        navigate('/onboard/boarding');
      }
    }
  }, [isLoggingIn, isLoggedIn]);

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
        </Route>
      </Routes>
    </div>
  );
};

export default Router;
