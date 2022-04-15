import React from 'react';
import { VoyageContext } from '../components/VoyageProvider';
import { VoyageController } from '../../controller';

const useVoyageController = () => {
  const context = React.useContext(VoyageContext);
  return context as VoyageController;
};

export default useVoyageController;
