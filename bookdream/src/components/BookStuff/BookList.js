import React, { useState } from 'react'
import BookOptionsModal from '../BookOptionsModal'
import { removeBooks } from '../../openlibrary/openlibrary'

const BookList = ({
  books,
  setBooks,
  selectMode,
  setSelectMode,
  checkedCount,
  setCheckedCount,
  checkedBooks,
  setCheckedBooks
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mousPos, setMousePos] = useState({ x: 0, y: 0 })
  const [startTime, setStartTime] = useState(null)

  const handleMouseDown = event => {
    event.stopPropagation()
    const currentTime = new Date().getTime()
    setStartTime(currentTime)
  }

  const handleMouseUp = event => {
    event.stopPropagation()
    if (startTime) {
      const currentTime = new Date().getTime()
      const duration = currentTime - startTime
      const durationSeconds = duration / 1000
      if (durationSeconds >= 0.5) {
        setSelectMode(true)
      } else if (durationSeconds < 0.5) {
        if (!selectMode) {
          if (!isOpen) {
            setIsOpen(true)
            setMousePos({ x: event.clientX, y: event.clientY })
          } else {
            setIsOpen(false)
          }
        }
      }
      setStartTime(null)
    }
  }

  const onClose = () => {
    setIsOpen(false)
  }
  const handleCheckboxChange = isbn => {
    setCheckedBooks(prevCheckedBooks => ({
      ...prevCheckedBooks,
      [isbn]: !prevCheckedBooks[isbn] // Toggle the checkbox for the specific ISBN
    }))
  }

  return (
    <>
      {books && books.length > 0 ? (
        <div className='BookList'>
          {checkedCount > 0 ? <p>{checkedCount} Books Selected</p> : <></>}
          {books.map((book, index) => {
            const isbn = Object.keys(book)[0] // Extract ISBN from each object
            const bookData = book[isbn] // Get the book data using the ISBN as key
            return (
              <div
                className='BookTile'
                key={isbn}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseUp}
                onMouseUp={handleMouseUp}
              >
                {selectMode ? (
                  <input
                    type='checkbox'
                    checked={checkedBooks[isbn] || false} // Checkbox state
                    onChange={() => handleCheckboxChange(isbn)} // Handle checkbox change
                  />
                ) : (
                  <></>
                )}

                <BookOptionsModal
                  isOpen={isOpen}
                  position={mousPos}
                  onClose={onClose}
                  book={isbn}
                />
                {bookData.cover.Medium ? (
                  <img
                    className='BookTileImage'
                    src={bookData.cover.Medium}
                    alt='book_image'
                  />
                ) : (
                  <img
                    className='BookTileImage'
                    src='/open-book.png'
                    alt='book_image'
                  />
                )}
                <p>{bookData.title}</p>
              </div>
            )
          })}
          {selectMode && checkedCount > 0 ? (
            <button
              className='DeleteButton'
              onClick={() =>
                removeBooks(
                  checkedBooks,
                  setBooks,
                  checkedCount,
                  setCheckedCount
                )
              }
            >
              Delete
            </button>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <p>No books found</p>
      )}
    </>
  )
}

export default BookList
