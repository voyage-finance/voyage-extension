import React from 'react';
import { VoyageController } from '../../controller';
export const VoyageContext = React.createContext<VoyageController | null>(null);
interface Props {
  controller: VoyageController;
}
const VoyageProvider: React.FC<Props> = ({ controller, children }) => {
  return (
    <VoyageContext.Provider value={controller}>
      {children}
    </VoyageContext.Provider>
  );
};

export default VoyageProvider;
