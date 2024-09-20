import {
  usersCollection,
  account,
  databaseKey,
  databases,
} from "../appwrite/appwriteConfig";

export function httpGetAsync(theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState === 4) {
      if (xmlHttp.status === 200) {
        callback(JSON.parse(xmlHttp.responseText));
      } else {
        callback(null);
      }
    }
  };
  xmlHttp.open("GET", theUrl, true);
  xmlHttp.send(null);
}

export async function fetchAuthorNames(authors) {
  try {
    const names = await Promise.all(
      authors.map(async (author) => {
        const response = await fetch(
          `https://openlibrary.org${author.key}.json`
        );
        const authorData = await response.json();
        return authorData.name;
      })
    );
    return names;
  } catch (error) {
    console.error("Error fetching author names", error);
    return [];
  }
}

export async function checkImageExists(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    console.error("Error checking image existence", error);
    return false;
  }
}

export const getBooks = async () => {
  try {
    const accountData = await getAccount();
    const userDocument = await databases.getDocument(
      databaseKey,
      usersCollection,
      accountData.$id
    );
    return userDocument?.Books ? userDocument.Books : "[]"; // Return valid JSON string
  } catch (error) {
    console.error("Error fetching user document:", error);
    return "[]"; // Return an empty array as JSON if there’s an error
  }
};

export const getAccount = async () => {
  try {
    const response = await account.get(); // Use await here
    return response; // Return the resolved value
  } catch (error) {
    console.error("Error fetching account:", error);
    throw error; // Rethrow the error so it can be caught where needed
  }
};

export const removeBooks = async (
  books,
  setBooks,
  checkedCount,
  setCheckedCount,
  setSelectMode,
  setCheckedBooks
) => {
  try {
    const accountData = await getAccount(); // Ensure getAccount() is awaited properly
    const id = accountData.$id; // Now you can access $id safely

    const userDocument = await databases.getDocument(
      databaseKey,
      usersCollection,
      id
    );
    if (userDocument.Books) {
      let databaseBooks = JSON.parse(userDocument.Books); // Make sure you are parsing the correct field
      const filteredBooks = databaseBooks.filter((databaseBook) => {
        const isbn = Object.keys(databaseBook)[0]; // Extract the ISBN from the book object
        return !books[isbn]; // Return true if the book is not marked for removal
      });
      setBooks(filteredBooks);
      setCheckedCount(0);
      setSelectMode(false);
      setCheckedBooks({});
      // books = books.filter(book => !book.hasOwnProperty(isbn))
      // Save the updated books back to the database
      await databases.updateDocument(databaseKey, usersCollection, id, {
        Books: JSON.stringify(filteredBooks),
      });
    }
  } catch (error) {
    console.error("Error deleting book:", error);
  }
};

export const checkForBook = async (currentBook, oldBooks) => {
  try {
    const isbnExists = oldBooks.some((book) => {
      const isbn = Object.keys(book)[0];
      return isbn === currentBook.getIsbn();
    });
    if (isbnExists) {
      console.log(true);
      return true;
    } else {
      console.log(false);
      return false;
    }
  } catch (e) {
    console.error("Error parsing JSON: " + e);
    return null;
  }
};
