// Profile.js
import { useState, useEffect, useCallback } from 'react'
import {
  account,
  databases,
  usersCollection,
  databaseKey
} from '../appwrite/appwriteConfig'
import { useNavigate } from 'react-router-dom'
import Book from './BookStuff/Book'
import * as op from '../openlibrary/openlibrary'
import BookList from './BookStuff/BookList'
import LookupTile from './BookStuff/BookUploadTile' // Import LookupTile

function Profile () {
  const navigate = useNavigate()
  const [bookScanned, setBookScanned] = useState(false)
  const [userDetails, setUserDetails] = useState()
  const [currentBook, setCurrentBook] = useState(null)
  const [isbn, setIsbn] = useState('')
  const [scanState, setScanState] = useState('No Book Scanned')
  const [books, setBooks] = useState([])
  const [selectMode, setSelectMode] = useState(false)
  const [checkedBooks, setCheckedBooks] = useState({})
  const [checkedCount, setCheckedCount] = useState()

  //   const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleLogout = async () => {
    try {
      await account.deleteSession('current')
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }

  const getBooks = useCallback(async () => {
    try {
      const userDocument = await databases.getDocument(
        databaseKey,
        usersCollection,
        userDetails.$id
      )
      return userDocument?.Books ? userDocument.Books : '[]'
    } catch (error) {
      console.error('Error fetching user document:', error)
      return '[]'
    }
  }, [userDetails])

  useEffect(() => {
    setCheckedCount(Object.values(checkedBooks).filter(Boolean).length)
    const fetchBooks = async () => {
      const booksString = await getBooks()
      const books = JSON.parse(booksString) || []
      setBooks(books)
    }

    fetchBooks()
  }, [getBooks, bookScanned, checkedBooks])

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

  useEffect(() => {
    const handleKeyPress = e => {
      if (e.key === 'Enter') {
        createBook(isbn)
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

  const handleBookUpload = async () => {
    if (currentBook) {
      let oldBooksString = await getBooks()
      let oldBooks = []

      try {
        oldBooks = JSON.parse(oldBooksString) || []
        const isbnExists = oldBooks.some(book => {
          const isbn = Object.keys(book)[0] // Get the ISBN key from each object
          return isbn === currentBook.getIsbn() // Check if it matches the ISBN to check
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
  const onClick = event => {
    console.log('setting select to false from Profile')
    setSelectMode(false)
    setCheckedBooks(0)
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
            <header>
              <div className='NavBar'>
                <h5 className='BoldText'>
                  Welcome to Book Dream {userDetails.name}
                </h5>
                <button className='Logout' onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </header>
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

export default Profile
