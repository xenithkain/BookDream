// Profile.js
import { useState, useEffect, useCallback } from 'react'
import {
  account,
  databases,
  usersCollection,
  databaseKey
} from '../appwrite/appwriteConfig'
import { useNavigate } from 'react-router-dom'
import Book from '../components/Book'
import * as op from '../openlibrary/openlibrary'
import BookList from '../components/BookList'
import LookupTile from '../components/BookUploadTile' // Import LookupTile

function ProfilePage () {
  const navigate = useNavigate()

  //   const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const getData = account.get()
    getData.then(
      response => {
        setUserDetails(response)
      },
      error => {
        console.log(error)
      }
    )
  }, [])

  const handleBookUpload = async () => {
    if (currentBook) {
      let oldBooksString = await getBooks()
      let oldBooks = []

      try {
        oldBooks = JSON.parse(oldBooksString) || []
        const isbnExists = oldBooks.some(book => {
          const isbn = Object.keys(book)[0]
          return isbn === currentBook.getIsbn()
        })
        if (isbnExists) {
          return
        }
      } catch (e) {
        console.error('Error parsing JSON: ' + e)
        oldBooks = []
      }

      if (!Array.isArray(oldBooks)) {
        oldBooks = []
      }

      oldBooks.push(currentBook.returnJson())
      const newBooksString = JSON.stringify(oldBooks)

      const promise = databases.updateDocument(
        databaseKey,
        usersCollection,
        userDetails.$id,
        {
          Name: userDetails.name,
          Books: newBooksString
        }
      )
      promise.then(
        response => {
          console.log('Book saved:', response)
          setBookScanned(false)
        },
        error => {
          console.log('Error saving book:', error)
          setBookScanned(false)
        }
      )
    }
  }

  const createBook = isbn => {
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
            setCurrentBook(newBook)
            setBookScanned(true)
          } else {
            // Clear book details if no book found
            setCurrentBook(null)
            setScanState('Book Not Found')
          }
        }
      )
    } else {
      // Clear book details if not a valid ISBN
      setCurrentBook(null)
      setScanState('Not an ISBN Number')
    }
  }

  return (
    <>
      {userDetails ? (
        <>
          <div className='ProfilePage'>
            {selectMode ? (
              <button onClick={onClick}>Stop Select</button>
            ) : (
              <></>
            )}
            <div className='HorizontalBox'>
              <BookList
                books={books}
                setBooks={setBooks}
                selectMode={selectMode}
                setSelectMode={setSelectMode}
                checkedCount={checkedCount}
                setCheckedCount={setCheckedCount}
                checkedBooks={checkedBooks}
                setCheckedBooks={setCheckedBooks}
              />
              <LookupTile
                book={currentBook}
                scanState={scanState}
                handleBookUpload={handleBookUpload}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <p>Please Login</p>
          <button onClick={() => navigate('/login')}>Login</button>
        </>
      )}
      <footer>
        <a href='https://www.flaticon.com/free-icons/book' title='book icons'>
          Book icons created by Freepik - Flaticon
        </a>
      </footer>
    </>
  )
}

export default ProfilePage
