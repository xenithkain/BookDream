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
import * as op from '../openlibrary/openlibrary'

function BookshelvesPage ({ setShowNav }) {
  setShowNav(true)
  const [books, setBooks] = useState([])
  const [selectMode, setSelectMode] = useState(false)
  const [checkedBooks, setCheckedBooks] = useState({})
  const [checkedCount, setCheckedCount] = useState()
  const [userDetails, setUserDetails] = useState()
  const [bookScanned, setBookScanned] = useState(false)

  const { isScanModalOpen, closeModal } = useModal()

  const onClick = event => {
    console.log('setting select to false from Profile')
    setSelectMode(false)
    setCheckedBooks(0)
  }

  useEffect(() => {
    setCheckedCount(Object.values(checkedBooks).filter(Boolean).length)
    const fetchBooks = async () => {
      const booksString = await op.getBooks()
      console.log('Fetched books string:', booksString) // Debug log
      try {
        const books = JSON.parse(booksString) || [] // Safely parse JSON
        console.log('Parsed books:', books) // Debug log
        setBooks(books)
        setBookScanned(false)
      } catch (e) {
        console.error('Error parsing books JSON:', e)
        setBooks([]) // Fallback to an empty array in case of parsing error
        setBookScanned(false)
      }
    }

    fetchBooks()
  }, [bookScanned, checkedBooks])

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
          <div className='ModalOverlay' onClick={closeModal}>
            {/* Pass click event propagation stop in the modal */}
            <ScanModal
              isOpen={isScanModalOpen}
              books={books}
              setBooks={setBooks}
              setBookScanned={setBookScanned}
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
