import React, { createContext, useState, useContext } from "react";

// Create the Context
const AddClassroomModalContext = createContext();

// Create a provider component
export const AddClassroomModalProvider = ({ children }) => {
  const [isAddClassroomModalOpen, setIsAddClassroomModalOpen] = useState(false);

  const openModal = () => {
    setIsAddClassroomModalOpen(true);
  };

  const closeModal = () => {
    setIsAddClassroomModalOpen(false);
  };

  return (
    <AddClassroomModalContext.Provider
      value={{
        isAddClassroomModalOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
    </AddClassroomModalContext.Provider>
  );
};

export const useAddClassroomModal = () => useContext(AddClassroomModalContext);
