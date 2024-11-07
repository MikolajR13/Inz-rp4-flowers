import React, { createContext, useContext, useState } from 'react';

const PlantDataContext = createContext();

export const PlantDataProvider = ({ children }) => {
  const [plantData, setPlantData] = useState(null);

  return (
    <PlantDataContext.Provider value={{ plantData, setPlantData }}>
      {children}
    </PlantDataContext.Provider>
  );
};

export const usePlantData = () => useContext(PlantDataContext);
