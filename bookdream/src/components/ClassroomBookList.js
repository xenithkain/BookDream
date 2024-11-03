import { useState, useEffect } from "react";
import BookOptionsModal from "./modals/BookOptionsModal";

const ClassroomBookList = ({ books, setModalFields, bookSearch }) => {
  // Initialize the selection state to an array of false values
  const [isSelectedList, setIsSelectedList] = useState(
    Array(books.length).fill(false)
  );
  const [sortedBooks, setSortedBooks] = useState(books);

  useEffect(() => {
    setSortedBooks(books);
  }, [books]);

  // Update selectedBooks based on isSelectedList whenever it changes
  useEffect(() => {
    const selectedBooks = books.filter((_, index) => isSelectedList[index]);
    setModalFields((prev) => ({ ...prev, chosenBooks: selectedBooks }));
  }, [isSelectedList, books, setModalFields]);

  useEffect(() => {
    setSortedBooks((oldbooks) => {
      let newBooks = [];
      newBooks = books.filter((item) => {
        if (!newBooks.includes(item)) {
          return item.title.includes(bookSearch);
        } else {
          return;
        }
      });
      oldbooks.forEach((book) => {
        if (!newBooks.includes(book)) {
          if (book.title.includes(bookSearch)) {
            newBooks.push(book);
          }
        }
      });
      return newBooks;
    });
  }, [bookSearch]);

  const toggleBookSelection = (index) => {
    setIsSelectedList((prevList) => {
      const newList = [...prevList];
      newList[index] = !newList[index]; // Toggle the selected status
      return newList;
    });
  };

  return (
    <>
      {sortedBooks.map((book, index) => {
        const isSelected = isSelectedList[index];
        return (
          <div
            className="classroom_book_container"
            key={index}
            onClick={() => toggleBookSelection(index)} // Use an arrow function here
          >
            <div
              className={`classroom_book_selected_tag ${
                isSelected ? "selected" : ""
              }`}
            ></div>
            <img
              className="classroom_book_cover"
              src={book.getCover("Medium")}
              alt={book.title}
              style={{ height: "50%", width: "50%" }}
            />
            <div className="classroom_book_details_container">
              <p>{book.title}</p>
              <p>{book.authors}</p>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ClassroomBookList;
