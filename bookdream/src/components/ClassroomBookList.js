import { useState } from "react";

const ClassroomBookList = ({ books }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [checkedBooks, setCheckedBooks] = useState([]);
  const [checkedCount, setCheckedCount] = useState(0);

  const handleQuitSelection = () => {
    setSelectMode(false);
    setCheckedCount(0);
    setCheckedBooks({});
  };

  const handleMouseDown = (event) => {
    event.stopPropagation();
    const currentTime = new Date().getTime();
    setStartTime(currentTime);
  };

  const handleMouseUp = (event) => {
    event.stopPropagation();
    if (startTime) {
      const currentTime = new Date().getTime();
      const duration = currentTime - startTime;
      const durationSeconds = duration / 1000;
      if (durationSeconds >= 0.5) {
        setSelectMode(true);
      } else if (durationSeconds < 0.5) {
        if (!selectMode) {
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        }
      }
      setStartTime(null);
    }
  };

  const handleCheckboxChange = (book) => {
    let id = book.id;
    setCheckedBooks((prevCheckedBooks) => {
      const newCheckedValue = !prevCheckedBooks[id];
      if (newCheckedValue !== prevCheckedBooks[id]) {
        // Check for change
        return {
          ...prevCheckedBooks,
          [id]: newCheckedValue,
        };
      }
      return prevCheckedBooks; // No change, return previous state
    });
  };

  return (
    <>
      {selectMode ? (
        <button className="SelectModeQuitButton" onClick={handleQuitSelection}>
          x
        </button>
      ) : (
        <></>
      )}
      {books.map((book, index) => {
        let id = book.id;
        return (
          <div
            className="classroom_book_container"
            key={index}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            {selectMode ? (
              <input
                type="checkbox"
                checked={checkedBooks[id] || false}
                onChange={() => handleCheckboxChange(book)}
              />
            ) : (
              <></>
            )}
            <img
              className="classroom_book_cover"
              src={book.getCover("medium")}
            ></img>
            <div className="classroom_book_details_container">
              <p style={{ fontSize: "var(--medium-font)" }}>{book.title}</p>
              <p style={{ fontSize: "var(--small2-font)", fontWeight: "bold" }}>
                {book.authors}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ClassroomBookList;
