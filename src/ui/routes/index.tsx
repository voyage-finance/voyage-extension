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

const Router: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isOnboardingFlow = location.pathname.startsWith('/onboard');
  const needToShowMenubar = location.pathname !== '/' && !isOnboardingFlow;

  useEffect(() => {
    navigate('/onboard/signin');
  }, []);

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

        <Route path="/onboard/signin" element={<EnterEmailStep />} />
        <Route path="/onboard/boarding" element={<BoardingState />} />
        <Route path="/onboard/checkemail" element={<CheckEmailStep />} />
      </Routes>
    </div>
  );
};

export default Router;
