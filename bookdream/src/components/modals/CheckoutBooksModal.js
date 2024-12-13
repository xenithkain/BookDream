import React, { useState, useEffect } from "react";
import { useCheckoutBooksModal } from "../../contexts/CheckoutBooksModalContext"; // Updated context import
import { FaXmark } from "react-icons/fa6";
import { ImCheckmark } from "react-icons/im";
import {
  checkoutBookFromClassroom,
  getStudents,
} from "../../appwrite/appwriteConfig";
function CheckoutBooksModal({ classroom }) {
  const { closeCheckoutBooksModal, isCheckoutBooksModalOpen } =
    useCheckoutBooksModal(); // Updated hook

  const [checkoutBooksModalStatus, setCheckoutBooksModalStatus] = useState(
    "Please Scan Student Student ID Card"
  );
  const [scannedID, setScannedID] = useState("");
  const [scanData, setScanData] = useState("");
  const [currentStudent, setCurrentStudent] = useState(null);
  const [isbn, setIsbn] = useState("");
  const [scannedIsbn, setScannedIsbn] = useState("");

  useEffect(() => {
    const handleKeyPress = async (e) => {
      if (e.key === "Enter") {
        if (!currentStudent) {
          setScannedID(scanData);
          getStudents([scanData]).then((student) => {
            if (student) {
              setCheckoutBooksModalStatus(
                <>
                  Scanned Student ID: {scanData}
                  <br />
                  Student: {student.name}
                  <br />
                  Please Scan Book To Checkout
                </>
              );
              setCurrentStudent(student);
            } else {
              setCheckoutBooksModalStatus("Couldn't Find Student");
            }
          });
          setScanData("");
        } else {
          setScannedIsbn(isbn);
          checkoutBookFromClassroom(classroom, isbn, scannedID).then((book) => {
            if (book) {
              console.log(book);
              setCheckoutBooksModalStatus(
                <>
                  Student {currentStudent.name} checkout out {book.name}
                </>
              );
            } else {
              setCheckoutBooksModalStatus("Can't checkout that book");
            }
          });
        }
      } else if (e.key !== "Enter") {
        if (!currentStudent) {
          setScanData((prevData) => prevData + e.key);
        } else {
          setIsbn((prevData) => prevData + e.key);
        }
      }
    };

    document.addEventListener("keypress", handleKeyPress);

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  });

  const handleSave = () => {
    closeCheckoutBooksModal();
  };

  if (!isCheckoutBooksModalOpen) return null; // Updated condition

  return (
    <>
      <div className="checkoutbooks_modal_screen_overlay">
        <div className="modal_actions">
          <div
            className="modal_cancel_button"
            onClick={closeCheckoutBooksModal}
          >
            <FaXmark />
          </div>
        </div>

        <div
          className="checkoutbooks_modal_container"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="checkoutbooks_modal_status">
            {checkoutBooksModalStatus}
          </div>
        </div>
      </div>
    </>
  );
}

export default CheckoutBooksModal; // Updated export
