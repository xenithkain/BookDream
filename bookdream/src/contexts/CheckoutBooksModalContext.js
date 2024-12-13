import React, { createContext, useState, useContext } from "react";

// Create the Context
const CheckoutBooksModalContext = createContext();

// Create a provider component
export const CheckoutBooksModalProvider = ({ children }) => {
  const [isCheckoutBooksModalOpen, setIsCheckoutBooksModalOpen] =
    useState(false);

  const openCheckoutBooksModal = () => {
    setIsCheckoutBooksModalOpen(true);
  };

  const closeCheckoutBooksModal = () => {
    setIsCheckoutBooksModalOpen(false);
  };

  return (
    <CheckoutBooksModalContext.Provider
      value={{
        isCheckoutBooksModalOpen,
        openCheckoutBooksModal,
        closeCheckoutBooksModal,
      }}
    >
      {children}
    </CheckoutBooksModalContext.Provider>
  );
};

export const useCheckoutBooksModal = () =>
  useContext(CheckoutBooksModalContext);
