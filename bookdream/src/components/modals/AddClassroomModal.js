import React, { useState, useEffect } from "react";
import { useAddClassroomModal } from "../../contexts/AddClassroomModalContext"; // Updated context import
import { HexColorPicker } from "react-colorful";
import ClassroomBookList from "../ClassroomBookList";
import { fetchAvailableBooks } from "../../appwrite/appwriteConfig";
import Book from "../Book";
import StudentNameList from "../StudentNameList";
import { FaXmark } from "react-icons/fa6";
import { ImCheckmark } from "react-icons/im";
function AddClassroomModal({ onSave, books }) {
  const { closeModal, isAddClassroomModalOpen } = useAddClassroomModal(); // Updated hook
  const [classroomName, setClassroomName] = useState("");
  const [classroomColor, setClassroomColor] = useState("000000");
  const [chosenBooks, setChosenBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [bookSearch, setBookSearch] = useState("");
  const [studentInput, setStudentInput] = useState("");

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setStudents((prev) => {
        return [...prev, studentInput];
      });
      setStudentInput("");
    }
  };

  const handleSave = () => {
    onSave(classroomName, classroomColor, chosenBooks, students);
    closeModal();
  };

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

  if (!isAddClassroomModalOpen) return null; // Updated condition

  return (
    <>
      <div className="add_classroom_modal_screen_overlay">
        <div className="add_classroom_modal_actions">
          <div
            className="add_classroom_modal_accept_button"
            onClick={handleSave}
          >
            <ImCheckmark />
          </div>
          <div
            className="add_classroom_modal_cancel_button"
            onClick={closeModal}
          >
            <FaXmark />
          </div>
        </div>

        <div
          className="add_classroom_modal_container"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="add_classroom_modal_name_input add_classroom_modal_input">
            <label className="add_classroom_modal_label">Name</label>
            <input
              className="add_classroom_modal_text_input"
              type="text"
              placeholder="Enter Classroom Name"
              onChange={(newName) => setClassroomName(newName.target.value)}
            ></input>
          </div>
          <div className="add_classroom_modal_color_input add_classroom_modal_input">
            <label className="add_classroom_modal_label">Color</label>
            <HexColorPicker
              style={{ width: "100%" }}
              color={classroomColor}
              onChange={(color) => setClassroomColor(color)}
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
                onChange={(e) => {
                  setBookSearch(e.target.value);
                }}
              ></input>
            </div>
            <div className="add_classroom_modal_books_container">
              <ClassroomBookList
                books={availableBooks}
                setChosenBooks={setChosenBooks}
                bookSearch={bookSearch}
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
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={50}
              ></input>
            </div>

            <div className="add_classroom_modal_students_name_container">
              <StudentNameList students={students} setStudents={setStudents} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddClassroomModal; // Updated export
