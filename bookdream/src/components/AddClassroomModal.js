import React, { useState, useEffect } from "react";
import { useAddClassroomModal } from "./AddClassroomModalContext"; // Updated context import
import { HexColorPicker } from "react-colorful";
import ClassroomBookList from "./ClassroomBookList";
import { fetchAvailableBooks } from "../appwrite/appwriteConfig";
import Book from "./Book";

function AddClassroomModal({ onSave, books }) {
  const { closeModal, isAddClassroomModalOpen } = useAddClassroomModal(); // Updated hook
  const [modalFields, setModalFields] = useState({
    name: "",
    chosenBooks: [],
    color: "",
    shape: "", // Initialize shape
  });
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [color, setColor] = useState("#aabbcc");
  const [availableBooks, setAvailableBooks] = useState([]);

  useEffect(() => {
    const getAvaialbleBooks = async () => {
      let b = await fetchAvailableBooks();
      let newBooks = [];
      b.forEach((book) => {
        newBooks.push(
          new Book(
            book.title,
            book.authors,
            book.genres,
            book.covers,
            book.tags,
            book.isbn,
            book.$id
          )
        );
      });
      console.log(newBooks);
      setAvailableBooks(newBooks);
    };
    getAvaialbleBooks();
  }, []);

  const toggleBookSelection = (bookId) => {
    setModalFields((prev) => ({
      ...prev,
      chosenBooks: prev.chosenBooks.includes(bookId)
        ? prev.chosenBooks.filter((id) => id !== bookId) // Remove book if already selected
        : [...prev.chosenBooks, bookId], // Add book if not selected
    }));
  };

  const handleSave = () => {
    onSave(modalFields.name, modalFields.color, modalFields.chosenBooks);
    closeModal();
  };

  const updateField = (field, value) => {
    setModalFields((prev) => ({ ...prev, [field]: value }));
  };

  if (!isAddClassroomModalOpen) return null; // Updated condition

  return (
    <>
      <div className="add_classroom_modal_screen_overlay">
        <div className="add_classroom_modal_container">
          <div className="add_classroom_modal_name_input add_classroom_modal_input">
            <label className="add_classroom_modal_label">Name</label>
            <input
              className="add_classroom_modal_text_input"
              type="text"
              placeholder="Enter Classroom Name"
            ></input>
          </div>
          <div className="add_classroom_modal_color_input add_classroom_modal_input">
            <label className="add_classroom_modal_label">Color</label>
            <HexColorPicker
              style={{ width: "100%" }}
              color={color}
              onChange={setColor}
            />
          </div>
          <div className="add_classroom_modal_books_input add_classroom_modal_input">
            <div className="horizontal_alligner">
              <label className="add_classroom_modal_label">Books</label>
              <input
                style={{ width: "50%" }}
                className="add_classroom_modal_text_input"
                type="text"
                placeholder="Search for Book {Tag, Name, Author}"
              ></input>
            </div>
            <div className="add_classroom_modal_books_container">
              <ClassroomBookList
                books={availableBooks}
                setSelectedBooks={setSelectedBooks}
              />
            </div>
          </div>
          <div className="add_classroom_modal_students_input add_classroom_modal_input">
            <div className="horizontal_alligner">
              <label className="add_classroom_modal_label">Students</label>
              <input
                className="add_classroom_modal_text_input"
                type="text"
                placeholder="Enter Student Name"
              ></input>
            </div>

            <div className="add_classroom_modal_students_name_container"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddClassroomModal; // Updated export
