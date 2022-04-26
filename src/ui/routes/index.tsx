import { Route, Routes } from 'react-router-dom';
import Connect from '@containers/Connect';
import Home from '@containers/Home';

const Router: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/connect" element={<Connect />} />
    </Routes>
  );
};

export default Router;
