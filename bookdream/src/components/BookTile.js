import Book from '../components/Book'

function BookTile ({ book }) {
  return (
    <>
      <div className='BookTileContainer'>
        <img src={book.getCover('Medium')} alt='Book Cover'></img>
        <div className='BookTileInformation'>
          <p>
            {book.title.length < 40
              ? book.title
              : book.title.slice(0, 40) + '...'}
          </p>
          <p>{book.authors[0]}</p>
        </div>
      </div>
    </>
  )
}

export default BookTile
