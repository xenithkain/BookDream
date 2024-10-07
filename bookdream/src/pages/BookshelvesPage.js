import { useState, useEffect } from 'react'
import BookList from '../components/BookList'
import ScanModal from '../components/ScanModal'
import { useModal } from '../components/ScanModalContext'
import { getBooks, getTags, account } from '../appwrite/appwriteConfig'
import Tag from '../components/Tag'
import { sortList } from '../components/utility'

function BookshelvesPage ({ setShowNav }) {
  setShowNav(true)
  const [books, setBooks] = useState([])
  const [selectMode, setSelectMode] = useState(false)
  const [checkedBooks, setCheckedBooks] = useState({})
  const [checkedCount, setCheckedCount] = useState()
  const [userDetails, setUserDetails] = useState()
  const [bookScanned, setBookScanned] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  const { isScanModalOpen, closeModal } = useModal()

  useEffect(() => {
    setCheckedCount(Object.values(checkedBooks).filter(Boolean).length)
    const fetchBooks = async () => {
      let userBooks = await getBooks()
      try {
        setBooks(userBooks)
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
    async function fetchTags () {
      let sortedTags = await getTags()
      sortList(sortedTags)
      setTags(sortedTags)
    }
    fetchTags()
  }, [])

  const filteredBooks = books
  // searchText && selectedTags.length > 0
  //   ? books.filter(book => {
  //       let isbn = Object.keys(book)[0]
  //       const bookData = book[isbn]
  //       const titleMatches = bookData.title
  //         .toLowerCase()
  //         .includes(searchText.toLowerCase())
  //       const authorMatches = bookData.authors.some(author =>
  //         author.toLowerCase().includes(searchText.toLowerCase())
  //       )
  //       const tagsMatch = selectedTags.every(tag =>
  //         bookData.tags.some(selectedTag => selectedTag.name === tag.name)
  //       )

  //       return titleMatches && tagsMatch && authorMatches
  //     })
  //   : searchText
  //   ? books.filter(book => {
  //       let isbn = Object.keys(book)[0]
  //       const bookData = book[isbn]
  //       const titleMatches = bookData.title
  //         .toLowerCase()
  //         .includes(searchText.toLowerCase())
  //       const authorMatches = bookData.authors.some(author =>
  //         author.toLowerCase().includes(searchText.toLowerCase())
  //       )
  //       return titleMatches || authorMatches
  //     })
  //   : selectedTags.length > 0
  //   ? books.filter(book => {
  //       let isbn = Object.keys(book)[0]
  //       const bookData = book[isbn]

  //       return selectedTags.every(tag =>
  //         bookData.tags.some(selectedTag => selectedTag.name === tag.name)
  //       )
  //     })
  //   : books

  const handleAddScanTag = tagName => {
    const tagToAdd = tags.find(tag => tag.name === tagName)
    if (tagToAdd) {
      const updatedTags = tags.filter(tag => tag.name !== tagName)

      const updatedSelectedTags = [...selectedTags, tagToAdd]
      sortList(updatedTags)
      sortList(updatedSelectedTags)
      setTags(updatedTags)
      setSelectedTags(updatedSelectedTags)
    }
  }

  const handleRemoveScanTag = tagName => {
    const tagToAdd = selectedTags.find(tag => tag.name === tagName)
    if (tagToAdd) {
      const updatedSelectedTags = selectedTags.filter(
        tag => tag.name !== tagName
      )

      const updatedTags = [...tags, tagToAdd]
      sortList(updatedTags)
      sortList(updatedSelectedTags)
      setTags(updatedTags)
      setSelectedTags(updatedSelectedTags)
    }
  }
  useEffect(() => {
    const getData = account.get()
    getData.then(
      response => {
        setUserDetails(response)
      },
      error => {
        console.error(error)
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
        <div className='SearchContainer'>
          <div className='FormGroup'>
            <label htmlFor='Search'>Search</label>
            <input
              type='text'
              id='tag-search'
              value={searchText}
              style={{ border: '1px solid black', color: 'black' }}
              onChange={e => {
                setSearchText(e.target.value)
              }}
            />
          </div>

          <div className='ScanTagContainer'>
            <p>Tags to Add</p>
            <div className='TagList'>
              {selectedTags.map((tag, index) => {
                return (
                  <div key={tag.name}>
                    <Tag
                      name={tag.name}
                      shape={tag.shape}
                      color={tag.color}
                      textcolor={tag.textcolor}
                      description={tag.description}
                      handleMouseUp={() => handleRemoveScanTag(tag.name)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
          <div className='ScanTagContainer'>
            <p>Tags</p>
            <div className='TagList'>
              {tags.map((tag, index) => {
                return (
                  <div key={tag.name}>
                    <Tag
                      name={tag.name}
                      shape={tag.shape}
                      color={tag.color}
                      textcolor={tag.textcolor}
                      description={tag.description}
                      handleMouseUp={() => handleAddScanTag(tag.name)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <BookList
          books={filteredBooks}
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
