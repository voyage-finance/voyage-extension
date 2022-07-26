import { Route, Routes, useLocation } from 'react-router-dom';
import Connect from '@containers/Connect';
import styles from './index.module.scss';
import Approval from '@containers/Approval';
import Home from '@containers/Home';
import MenuBar from '@components/MenuBar/MenuBar';
import Settings from '@containers/Settings';
import SwitchNetwork from '@containers/SwitchNetwork';
import { networks } from '@utils/chain';
import Connections from '@containers/Connections';

const Router: React.FC = () => {
  const location = useLocation();
  return (
    <div className={styles.root}>
      {location.pathname !== '/login' && <MenuBar />}
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
      </Routes>
    </div>
  );
};

export default Router;
