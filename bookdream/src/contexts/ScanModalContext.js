import React, { createContext, useState, useContext } from "react";

// Create the Context
const ScanModalContext = createContext();

// Create a provider component
export const ScanModalProvider = ({ children }) => {
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const openScanBookModal = (x, y) => {
    setIsScanModalOpen(true);
  };

  const closeScanBookModal = () => {
    setIsScanModalOpen(false);
  };

  return (
    <ScanModalContext.Provider
      value={{
        isScanModalOpen,
        openScanBookModal,
        closeScanBookModal,
      }}
    >
      {children}
    </ScanModalContext.Provider>
  );
};

export const useScanBookModal = () => useContext(ScanModalContext);
