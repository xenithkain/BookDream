import React, { useState } from "react";
import BookOptionsModal from "./modals/BookOptionsModal";
import { removeBooks } from "../appwrite/appwriteConfig";

const BookList = ({ books, checkedBooks, setCheckedBooks }) => {
  const [isSelectedList, setIsSelectedList] = useState(
    books && books.length > 0 ? Array(books.length).fill(false) : []
  );
  const toggleBookSelection = (index) => {
    setCheckedBooks((prevList) => {
      const newList = [...prevList];
      newList[index] = !newList[index]; // Toggle the selected status
      return newList;
    });
  };

  return (
    <>
      {books && books.length > 0 ? (
        <>
          <div className="booklist_container">
            {books.map((book, index) => {
              const isSelected = checkedBooks ? checkedBooks[index] : false;

              return (
                <>
                  <div
                    className="booklist_book_container"
                    key={index}
                    onClick={() => toggleBookSelection(index)}
                  >
                    <div
                      className={`classroom_book_selected_tag ${
                        isSelected ? "selected" : ""
                      }`}
                    ></div>
                    <img src={book.getCover("Medium")}></img>
                    <p>{book.title}</p>
                  </div>
                </>
              );
            })}
          </div>
        </>
      ) : (
        <p>No books found</p>
      )}
    </>
  );
};

export default BookList;
//<div className="BookList">
//   {selectMode ? (
//     <button
//       className="SelectModeQuitButton"
//       onClick={handleQuitSelection}
//     >
//       x
//     </button>
//   ) : (
//     <></>
//   )}
//   {checkedCount > 0 ? <p>{checkedCount} Books Selected</p> : <></>}
//   {books.map((book, index) => {
//     const isbn = book.isbn;
//     const id = book.$id;
//     return (
//       <div
//         className="BookTile"
//         key={isbn}
//         onMouseDown={handleMouseDown}
//         onMouseLeave={handleMouseUp}
//         onMouseUp={handleMouseUp}
//       >
//         {selectMode ? (
//           <input
//             type="checkbox"
//             checked={checkedBooks[id] || false}
//             onChange={() => handleCheckboxChange(book)}
//           />
//         ) : (
//           <></>
//         )}

//         <BookOptionsModal
//           isOpen={isOpen}
//           position={mousPos}
//           onClose={onClose}
//           book={isbn}
//         />
//         {book.covers[1] ? (
//           <img
//             className="BookTileImage"
//             src={book.covers[1]}
//             alt="book_image"
//           />
//         ) : (
//           <img
//             className="BookTileImage"
//             src="/open-book.png"
//             alt="book_image"
//           />
//         )}
//         <p>
//           {book.title.length < 40
//             ? book.title
//             : book.title.slice(0, 40) + "..."}
//         </p>
//         <p style={{ fontWeight: "bold" }}>{book.authors[0]}</p>
//       </div>
//     );
//   })}
//   {selectMode && checkedCount > 0 ? (
//     <button
//       className="DeleteButton"
//       onClick={() => {
//         const selectedBookIds = Object.keys(checkedBooks).filter(
//           (bookId) => checkedBooks[bookId] === true
//         );
//         removeBooks(
//           selectedBookIds,
//           setBooks,
//           checkedCount,
//           setCheckedCount,
//           setSelectMode,
//           setCheckedBooks
//         );
//       }}
//     >
//       Delete
//     </button>
