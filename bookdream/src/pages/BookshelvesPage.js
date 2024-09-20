import { useState, useCallback, useEffect } from 'react'
import BookList from '../components/BookList'
import {
  account,
  databases,
  usersCollection,
  databaseKey
} from '../appwrite/appwriteConfig'
import ScanModal from '../components/ScanModal'
import { useModal } from '../components/ScanModalContext'

function BookshelvesPage ({ setShowNav }) {
  setShowNav(true)
  const [books, setBooks] = useState([])
  const [selectMode, setSelectMode] = useState(false)
  const [checkedBooks, setCheckedBooks] = useState({})
  const [checkedCount, setCheckedCount] = useState()
  const [userDetails, setUserDetails] = useState()
  const [bookScanned, setBookScanned] = useState(false)

  const { isScanModalOpen, closeModal } = useModal()

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

  const onClick = event => {
    console.log('setting select to false from Profile')
    setSelectMode(false)
    setCheckedBooks(0)
  }

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

  return (
    <>
      <div className='BookshelvesPageContainer'>
        {isScanModalOpen && (
          <div className='ScanModalOverlay' onClick={closeModal}>
            {/* Pass click event propagation stop in the modal */}
            <ScanModal
              isOpen={isScanModalOpen}
              books={books}
              setBooks={setBooks}
            />
          </div>
        )}
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
      </div>
    </>
  )
}

export default BookshelvesPage
