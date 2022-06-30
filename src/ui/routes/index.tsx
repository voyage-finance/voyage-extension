import { Route, Routes } from 'react-router-dom';
import Connect from '@containers/Connect';
import Link from '@containers/Link';
import styles from './index.module.scss';
import Approval from '@containers/Approval';
import Home from '@containers/Home';

const Router: React.FC = () => {
  return (
    <div className={styles.root}>
      <Routes>
        <Route path="/" element={<Link />} />
        <Route path="/home" element={<Home />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/approval/:requestId" element={<Approval />} />
      </Routes>
    </div>
  );
};

export default Router;
