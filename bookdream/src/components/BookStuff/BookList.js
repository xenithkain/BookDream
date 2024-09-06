import React, { useState } from 'react'
import BookOptionsModal from '../BookOptionsModal'

const BookList = ({ books }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mousPos, setMousePos] = useState({ x: 0, y: 0 })
  const onClose = () => {
    setIsOpen(false)
  }
  const onOpen = event => {
    if (!isOpen) {
      setIsOpen(true)
      setMousePos({ x: event.clientX, y: event.clientY })
    } else {
      setIsOpen(false)
    }
  }
  return (
    <>
      {books ? (
        <>
          <div className='BookList'>
            {books.map((book, index) => {
              const isbn = Object.keys(book)[0] // Extract ISBN from each object
              const bookData = book[isbn] // Get the book data using the ISBN as key
              return (
                <div className='BookTile' key={isbn} onClick={onOpen}>
                  <BookOptionsModal
                    isOpen={isOpen}
                    position={mousPos}
                    onClose={onClose}
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
          </div>
        </>
      ) : (
        <p>No books found</p>
      )}
    </>
  )
}

export default BookList
