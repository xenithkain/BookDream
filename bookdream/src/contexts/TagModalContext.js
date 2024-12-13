import React, { createContext, useState, useContext } from "react";

// Create the Context
const TagModalContext = createContext();

// Create a provider component
export const TagModalProvider = ({ children }) => {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const openTagModal = () => {
    setIsTagModalOpen(true);
  };

  const closeTagModal = () => {
    setIsTagModalOpen(false);
  };

  return (
    <TagModalContext.Provider
      value={{
        isTagModalOpen,
        openTagModal,
        closeTagModal,
      }}
    >
      {children}
    </TagModalContext.Provider>
  );
};

export const useTagModal = () => useContext(TagModalContext);
