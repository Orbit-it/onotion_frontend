// src/context/AppContext.js
import { createContext, useContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cache, setCache] = useState({
    inventoryData: [],
    projects: [],
    posts: [],
    lastUpdated: null
  });

  return (
    <AppContext.Provider value={{ cache, setCache }}>
      {children}
    </AppContext.Provider>
  );
};

// Créez un hook personnalisé pour utiliser le contexte
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};