import React, { createContext, useState, useContext } from "react";

// Create the Context
const TagModalContext = createContext();

// Create a provider component
export const TagModalProvider = ({ children }) => {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  //const [isAdd, setIsAdd] = useState(false)

  const openModal = (x, y) => {
    setIsTagModalOpen(true);
  };

  const closeModal = () => {
    setIsTagModalOpen(false);
  };

  return (
    <TagModalContext.Provider
      value={{
        isTagModalOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
    </TagModalContext.Provider>
  );
};

export const useTagModal = () => useContext(TagModalContext);
