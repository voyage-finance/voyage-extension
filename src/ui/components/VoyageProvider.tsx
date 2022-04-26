import React from 'react';
import { ControllerClient } from '../../rpc/virtual/client';
export const VoyageContext = React.createContext<ControllerClient | null>(null);
interface Props {
  controller: ControllerClient;
}
const VoyageProvider: React.FC<Props> = ({ controller, children }) => {
  return (
    <VoyageContext.Provider value={controller}>
      {children}
    </VoyageContext.Provider>
  );
};

export default VoyageProvider;
