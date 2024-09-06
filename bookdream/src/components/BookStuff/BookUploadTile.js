function BookUploadTile ({ book, scanState, handleBookUpload }) {
  return (
    <div className='Lookup-Tile'>
      {book ? (
        <>
          <h3>Title: {book.getTitle()}</h3>
          {book.getCover('Large') ? (
            <img
              className='coverImage'
              src={book.getCover('Large')}
              alt='book_image'
            />
          ) : (
            <h4>No cover available</h4>
          )}
          <h4>
            Authors:{' '}
            {book.getAuthors().length > 0
              ? book.getAuthors().join(', ')
              : 'Unknown'}{' '}
            <br />
            Genres:{' '}
            {book.getGenres().length > 0
              ? book.getGenres().join(', ')
              : 'Unknown'}
          </h4>
        </>
      ) : (
        <h4>{scanState}</h4>
      )}
      {book ? (
        <button className='UploadBookButton' onClick={handleBookUpload}>
          UploadBook
        </button>
      ) : (
        <></>
      )}
    </div>
  )
}
export default BookUploadTile
