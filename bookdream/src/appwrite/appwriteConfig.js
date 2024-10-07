import { Client, Databases, Account, Query } from 'appwrite'

const client = new Client()
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('66d8d3da001d5a4c82bb')
export const databaseKey = '66d8d504002297d3436f'
export const account = new Account(client)

export const databases = new Databases(client, databaseKey)

export const usersCollection = '66d8d5a90031df9dac29'
export const booksCollection = '67041ebc0032746cbba0'
export const studentsCollection = '67041ec0003da6255395'
export const classroomsCollection = '67041b1e000e47af29b6'
export const classroombooksCollection = '67041dce002bd96e7527'

export const removeTags = async checkedTags => {
  try {
    const accountData = await getAccount()
    const id = accountData.$id

    const userDocument = await databases.getDocument(
      databaseKey,
      usersCollection,
      id
    )

    if (userDocument.Tags) {
      let databaseTags = JSON.parse(userDocument.Tags)

      const filteredTags = databaseTags.filter(databaseTag => {
        const tagName = databaseTag.name
        return !checkedTags.includes(tagName)
      })

      await databases.updateDocument(databaseKey, usersCollection, id, {
        Tags: JSON.stringify(filteredTags)
      })
    }
  } catch (error) {
    console.error('Error deleting tag:', error)
  }
}

export const addTag = async tag => {
  try {
    let userDetails = await getAccount()
    let oldTags = await getTags()
    if (!Array.isArray(oldTags)) {
      oldTags = []
    }
    oldTags.push(tag)
    const newTagsString = JSON.stringify(oldTags)
    const promise = databases.updateDocument(
      databaseKey,
      usersCollection,
      userDetails.$id,
      {
        Tags: newTagsString
      }
    )
    promise.then(
      response => {
        console.log('Tag saved:', response.Tags)
      },
      error => {
        console.error('Error saving Tag:', error)
      }
    )
  } catch (error) {
    console.error('Error creating tag: ', error)
  }
}

export const getTags = async () => {
  try {
    const accountData = await getAccount()
    const userDocument = await databases.getDocument(
      databaseKey,
      usersCollection,
      accountData.$id
    )

    let tagsArray
    userDocument?.Tags
      ? (tagsArray = JSON.parse(userDocument.Tags))
      : (tagsArray = [])

    if (Array.isArray(tagsArray)) {
      return tagsArray
    } else {
      console.error('Fetched tags are not an array:', tagsArray)
    }
  } catch (error) {
    console.error('Error fetching user document: ', error)
    return []
  }
}

export const getAccount = async () => {
  try {
    const response = await account.get() // Use await here
    return response // Return the resolved value
  } catch (error) {
    console.error('Error fetching account:', error)
    throw error // Rethrow the error so it can be caught where needed
  }
}

export const removeBooks = async (
  books,
  setBooks,
  checkedCount,
  setCheckedCount,
  setSelectMode,
  setCheckedBooks
) => {
  try {
    const accountData = await getAccount() // Ensure getAccount() is awaited properly
    const id = accountData.$id // Now you can access $id safely

    const userDocument = await databases.getDocument(
      databaseKey,
      usersCollection,
      id
    )
    if (userDocument.Books) {
      let databaseBooks = JSON.parse(userDocument.Books) // Make sure you are parsing the correct field
      const filteredBooks = databaseBooks.filter(databaseBook => {
        const isbn = Object.keys(databaseBook)[0] // Extract the ISBN from the book object
        return !books[isbn] // Return true if the book is not marked for removal
      })
      setBooks(filteredBooks)
      setCheckedCount(0)
      setSelectMode(false)
      setCheckedBooks({})
      // books = books.filter(book => !book.hasOwnProperty(isbn))
      // Save the updated books back to the database
      await databases.updateDocument(databaseKey, usersCollection, id, {
        Books: JSON.stringify(filteredBooks)
      })
    }
  } catch (error) {
    console.error('Error deleting book:', error)
  }
}

export const getBooks = async () => {
  try {
    // Get the current user's account details
    const accountData = await getAccount()

    // Fetch the user's document to get the list of book IDs
    const userDocument = await databases.getDocument(
      databaseKey,
      usersCollection,
      accountData.$id
    )

    if (!userDocument.books || userDocument.books.length === 0) {
      console.log('No books found for this user.')
      return [] // Return an empty array if the user has no books
    }

    // Fetch all books by their IDs from the Books collection
    const bookPromises = userDocument.books.map(book =>
      databases.getDocument(databaseKey, booksCollection, book.$id)
    )

    // Resolve all the promises to get the full list of books
    const userBooks = await Promise.all(bookPromises)

    // Return the list of books
    return userBooks
  } catch (error) {
    console.error('Error fetching user books:', error)
    return [] // Return an empty array in case of error
  }
}

export const checkForBook = async isbn => {
  try {
    const response = await databases.listDocuments(
      databaseKey,
      booksCollection,
      [Query.equal('isbn', isbn)]
    )

    return response.documents > 0
  } catch (e) {
    console.error('Error fetching Books: ' + e)
    return false
  }
}

export const checkIfUserHasBook = async isbn => {
  try {
    const accountData = await getAccount()
    const userDocument = await databases.getDocument(
      databaseKey,
      usersCollection,
      accountData.$id
    )

    if (!userDocument.books || userDocument.books.length === 0) {
      console.log('No books found for user.')
      return false // No books exist
    }
    const userBooksPromises = userDocument.books.map(bookId =>
      databases.getDocument(databaseKey, booksCollection, bookId)
    )
    const userBooks = await Promise.all(userBooksPromises)

    // Check if the ISBN exists in the user's book collection
    const bookExists = userBooks.some(book => book.isbn === isbn)

    console.log('Book exists:', bookExists)
    return bookExists
  } catch (error) {
    console.error('Error checking if book exists:', error)
    return false
  }
}
