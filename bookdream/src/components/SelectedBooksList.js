const SelectedBookList = ({
  books,
  checkedBooks,
  setCheckedBooks,
  workSelected,
  setWorkSelected,
  chosenWork,
  setChosenWork,
}) => {
  const toggleBookSelection = (index) => {
    setCheckedBooks((prevList) => {
      const newList = [...prevList];
      newList[index] = !newList[index]; // Toggle the selected status
      console.log(newList);
      return newList;
    });
  };

  return (
    <>
      <div className="scanned_booklist_container">
        {books.map((book, index) => {
          const isSelected = checkedBooks ? checkedBooks[index] : false;
          return (
            <>
              <div
                className="scanned_booklist_book_container"
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
  );
};

export default SelectedBookList;
