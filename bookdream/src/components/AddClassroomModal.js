import React, { useState } from "react";
import { useAddClassroomModal } from "./AddClassroomModalContext"; // Updated context import

function AddClassroomModal({ onSave, books }) {
  const shapeOptions = ["Flag", "Rect", "Oval"];
  const { closeModal, isAddClassroomModalOpen } = useAddClassroomModal(); // Updated hook
  const [modalFields, setModalFields] = useState({
    name: "",
    chosenBooks: [],
    color: "",
    shape: "", // Initialize shape
  });

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
    <div className="AddClassroomModal">
      <div className="AddClassroomModalContent">
        <h2>Create a New Classroom</h2> {/* Updated heading */}
        {/* Input for Name */}
        <div className="FormGroup">
          <label htmlFor="ClassroomName">Name</label>
          <input
            type="text"
            id="classroom-name" // Updated ID
            value={modalFields.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>
        {/* Dropdown for Shape */}
        <div className="FormGroup">
          <label htmlFor="ClassroomShape">Shape</label>
          <select
            id="classroom-shape" // Updated ID
            value={modalFields.shape}
            onChange={(e) => updateField("shape", e.target.value)}
          >
            {shapeOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {/* Color Picker */}
        <div className="FormGroup">
          <label htmlFor="ClassroomColor">Color</label>
          <input
            type="color"
            id="classroom-color" // Updated ID
            value={modalFields.color}
            onChange={(e) => updateField("color", e.target.value)}
          />
        </div>
        {/* Book Selection Section */}
        <div className="BooksSelection">
          <h3>Select Books</h3>
          <div className="BookTiles">
            {books.map((book) => (
              <div
                key={book.$id}
                className={`BookTile ${
                  modalFields.chosenBooks.includes(book.$id) ? "selected" : ""
                }`}
                onClick={() => toggleBookSelection(book.$id)}
              >
                {book.title}
                {}
              </div>
            ))}
          </div>
        </div>
        {/* Save and Close Buttons */}
        <div className="FormButtons">
          <button onClick={handleSave}>Save</button>
          <button onClick={closeModal}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default AddClassroomModal; // Updated export
