import { useModal } from '../components/ScanModalContext'
import * as op from '../openlibrary/openlibrary'
import { useState, useEffect, useCallback } from 'react'
import Book from '../components/Book'

function ScanModal ({ isOpen, books, setBooks }) {
  const { isScanModalOpen, modalPos, closeModal, isBulk } = useModal()
  const [isbnNumbers, setISBNNumbers] = useState([])
  const [userDetails, setUserDetails] = useState()
  const [currentBook, setCurrentBook] = useState(null)
  const [scanState, setScanState] = useState('No Book Scanned')
  const [booksScanned, setBooksScanned] = useState([])
  const [isbn, setIsbn] = useState('')

  useEffect(() => {
    const handleKeyPress = e => {
      if (e.key === 'Enter') {
        setISBNNumbers(prevNums => [...prevNums, isbn])
        console.log(isbn)
        setIsbn('') // Clear buffer after processing
      } else if (e.key !== 'Enter') {
        setIsbn(prevIsbn => prevIsbn + e.key)
      }
    }

    document.addEventListener('keypress', handleKeyPress)

    return () => {
      document.removeEventListener('keypress', handleKeyPress)
    }
  })

  const findBooks = () => {
    isbnNumbers.forEach(isbn => {
      if (isbn.length > 0 && (isbn.length === 10 || isbn.length === 13)) {
        let newBook = new Book()
        op.httpGetAsync(
          `https://openlibrary.org/isbn/${isbn}.json`,
          async response => {
            if (response) {
              const urls = {
                Small: `https://covers.openlibrary.org/b/isbn/${isbn}-S.jpg`,
                Medium: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
                Large: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
              }
              newBook.setIsbn(isbn)
              newBook.setTitle(response.title ? response.title : '')
              newBook.setGenres(
                response.genres
                  ? response.genres
                  : response.subjects
                  ? response.subjects
                  : []
              )
              const coverExists =
                (await op.checkImageExists(urls.Small)) ||
                (await op.checkImageExists(urls.Medium)) ||
                (await op.checkImageExists(urls.Large)) ||
                false
              newBook.setCover(coverExists ? urls : '')
              if (response.authors) {
                const authors = await op.fetchAuthorNames(response.authors)
                newBook.setAuthors(authors)
              }
              setBooksScanned(oldBooks => [...oldBooks, newBook])
            } else {
              // Clear book details if no book found
              setScanState('Book Not Found')
            }
          }
        )
      }
    })
  }

  //   const createBook = isbnNumbers => {
  //     let items = 0
  //     if (isBulk) {
  //       items = isbnNumbers.legnth
  //     }
  //     for (let i = 0; items > 0; items--, i++) {
  //       let isbn = isbnNumbers[i]
  //       if (isbn.length > 0 && (isbn.length === 10 || isbn.length === 13)) {
  //         let newBook = new Book()
  //         op.httpGetAsync(
  //           `https://openlibrary.org/isbn/${isbn}.json`,
  //           async response => {
  //             if (response) {
  //               const urls = {
  //                 Small: `https://covers.openlibrary.org/b/isbn/${isbn}-S.jpg`,
  //                 Medium: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
  //                 Large: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
  //               }
  //               newBook.setIsbn(isbn)
  //               newBook.setTitle(response.title ? response.title : '')
  //               newBook.setGenres(
  //                 response.genres
  //                   ? response.genres
  //                   : response.subjects
  //                   ? response.subjects
  //                   : []
  //               )
  //               const coverExists =
  //                 (await op.checkImageExists(urls.Small)) ||
  //                 (await op.checkImageExists(urls.Medium)) ||
  //                 (await op.checkImageExists(urls.Large)) ||
  //                 false
  //               newBook.setCover(coverExists ? urls : '')
  //               if (response.authors) {
  //                 const authors = await op.fetchAuthorNames(response.authors)
  //                 newBook.setAuthors(authors)
  //               }
  //               setCurrentBook(newBook)
  //             } else {
  //               // Clear book details if no book found
  //               setCurrentBook(null)
  //               setScanState('Book Not Found')
  //             }
  //           }
  //         )
  //       } else {
  //         // Clear book details if not a valid ISBN
  //         setCurrentBook(null)
  //         setScanState('Not an ISBN Number')
  //       }
  //     }
  //   }

  if (isBulk) {
  } else {
  }

  if (!isScanModalOpen) return null

  return (
    <>
      <div
        onClick={e => e.stopPropagation()}
        className='ScanModelContainer'
        style={{
          position: 'absolute',
          left: modalPos.x - 0.25 * window.innerWidth,
          top: modalPos.y - 0.475 * window.innerHeight,
          display: isScanModalOpen ? 'block' : 'none'
        }}
      >
        {/* {booksScanned.map((book, index) => {
          const isbn = Object.keys(book)[0]
          const bookData = book[isbn]
          return (
            <div className='BookTile' key={isbn}>
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
        })} */}
        {isbnNumbers.length > 0 ? (
          <>
            {isbnNumbers.map((isbn, index) => {
              return (
                <>
                  <p>{isbn}</p>
                </>
              )
            })}
          </>
        ) : (
          <p>No isbns</p>
        )}
      </div>
    </>
  )
}

export default ScanModal
