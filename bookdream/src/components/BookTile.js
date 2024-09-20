import Book from "../components/Book";

function BookTile({ book }) {
  return (
    <>
      <div className="BookTileContainer">
        <img src={book.getCover("Medium")} alt="Book Cover"></img>
        <h5>{book.title}</h5>
        <h5>{book.authors}</h5>
      </div>
    </>
  );
}

export default BookTile;
