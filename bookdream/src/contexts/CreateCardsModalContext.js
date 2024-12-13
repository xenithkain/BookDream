import React, { createContext, useState, useContext } from "react";

// Create the Context
const CreateCardsModalContext = createContext();

// Create a provider component
export const CreateCardsModalProvider = ({ children }) => {
  const [isCreateCardsModalOpen, setIsCreateCardsModalOpen] = useState(false);

  const openCreateCardsModal = () => {
    setIsCreateCardsModalOpen(true);
  };

  const closeCreateCardsModal = () => {
    setIsCreateCardsModalOpen(false);
  };

  return (
    <CreateCardsModalContext.Provider
      value={{
        isCreateCardsModalOpen,
        openCreateCardsModal,
        closeCreateCardsModal,
      }}
    >
      {children}
    </CreateCardsModalContext.Provider>
  );
};

export const useCreateCardsModal = () => useContext(CreateCardsModalContext);
