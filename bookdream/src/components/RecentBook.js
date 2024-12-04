const RecentBook = ({ book }) => {
  const handleDateConversion = (date) => {
    let newDate = new Date(date);
    const formattedDate = newDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formattedDate;
  };
  return (
    <>
      <div className="recentbook_container">
        <img className="recentbook_cover" src={book.covers[1]}></img>
        <p className="recentbook_title">{book.title}</p>
        <p className="recentbook_added_date">
          {handleDateConversion(book.$createdAt)}
        </p>
      </div>
    </>
  );
};

export default RecentBook;
