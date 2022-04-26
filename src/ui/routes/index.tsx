import { Route, Routes } from 'react-router-dom';
import Connect from '@containers/Connect';
import Home from '@containers/Home';
import styles from './index.module.scss';
import Approval from '@containers/Approval';

const Router: React.FC = () => {
  return (
    <div className={styles.root}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/approval/:requestId" element={<Approval />} />
      </Routes>
    </div>
  );
};

export default Router;
