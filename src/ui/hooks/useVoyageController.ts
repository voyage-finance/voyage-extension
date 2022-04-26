import React from 'react';
import { VoyageContext } from '@components/VoyageProvider';
import { ControllerClient } from '../../rpc/virtual/client';

const useVoyageController = () => {
  const context = React.useContext(VoyageContext);
  return context as unknown as ControllerClient;
};

export default useVoyageController;
