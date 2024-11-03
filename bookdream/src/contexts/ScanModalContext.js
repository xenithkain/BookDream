import React, { createContext, useState, useContext } from "react";

// Create the Context
const ScanModalContext = createContext();

// Create a provider component
export const ScanModalProvider = ({ children }) => {
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isBulk, setIsBulk] = useState(false);

  const openModal = (x, y) => {
    setIsScanModalOpen(true);
  };

  const closeModal = () => {
    setIsScanModalOpen(false);
  };

  return (
    <ScanModalContext.Provider
      value={{
        isScanModalOpen,
        openModal,
        closeModal,
        isBulk,
        setIsBulk,
      }}
    >
      {children}
    </ScanModalContext.Provider>
  );
};

export const useModal = () => useContext(ScanModalContext);
