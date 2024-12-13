import { useEffect, useRef, useState } from "react";

const ClassroomOptionsDropdown = ({
  openCreateCardsModal,
  openCheckoutBooksModal,
  isOpen,
  setIsOpen,
}) => {
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <>
      <div
        className={`classroom_options_dropdown_container ${
          isOpen ? "open" : ""
        }`}
        ref={dropdownRef}
      >
        <div
          className="createcards_option_item"
          onClick={() => {
            openCreateCardsModal();
            setIsOpen(false);
          }}
        >
          Create Student Cards
        </div>
        <div
          className="checkoutbooks_option_item"
          onClick={() => {
            openCheckoutBooksModal();
            setIsOpen(false);
          }}
        >
          Checkout Books
        </div>
      </div>
    </>
  );
};

export default ClassroomOptionsDropdown;
