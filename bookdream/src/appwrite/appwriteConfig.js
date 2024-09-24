import { Client, Databases, Account } from "appwrite";

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("66d8d3da001d5a4c82bb");
export const databaseKey = "66d8d504002297d3436f";
export const account = new Account(client);

export const databases = new Databases(client, databaseKey);

export const usersCollection = "66d8d5a90031df9dac29";

export const removeTags = async (checkedTags) => {
  try {
    const accountData = await getAccount();
    const id = accountData.$id;

    const userDocument = await databases.getDocument(
      databaseKey,
      usersCollection,
      id
    );

    if (userDocument.Tags) {
      let databaseTags = JSON.parse(userDocument.Tags);

      const filteredTags = databaseTags.filter((databaseTag) => {
        const tagName = databaseTag.name;
        return !checkedTags.includes(tagName); // Only keep tags that are not checked
      });

      await databases.updateDocument(databaseKey, usersCollection, id, {
        Tags: JSON.stringify(filteredTags),
      });
    }
  } catch (error) {
    console.error("Error deleting tag:", error);
  }
};

export const addTag = async (tag) => {
  try {
    let userDetails = await getAccount();
    let oldTags = await getTags();
    if (!Array.isArray(oldTags)) {
      oldTags = [];
    }
    oldTags.push(tag);
    const newTagsString = JSON.stringify(oldTags);
    const promise = databases.updateDocument(
      databaseKey,
      usersCollection,
      userDetails.$id,
      {
        Tags: newTagsString,
      }
    );
    promise.then(
      (response) => {
        console.log("Tag saved:", response.Tags);
      },
      (error) => {
        console.error("Error saving Tag:", error);
      }
    );
  } catch (error) {
    console.error("Error creating tag: ", error);
  }
};

export const getTags = async () => {
  try {
    const accountData = await getAccount();
    const userDocument = await databases.getDocument(
      databaseKey,
      usersCollection,
      accountData.$id
    );

    let tagsArray;
    userDocument?.Tags
      ? (tagsArray = JSON.parse(userDocument.Tags))
      : (tagsArray = []);

    if (Array.isArray(tagsArray)) {
      return tagsArray;
    } else {
      console.error("Fetched tags are not an array:", tagsArray);
    }
  } catch (error) {
    console.error("Error fetching user document: ", error);
    return [];
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

export const checkForBook = async (currentBook, oldBooks) => {
  try {
    const isbnExists = oldBooks.some((book) => {
      const isbn = Object.keys(book)[0];
      return isbn === currentBook.getIsbn();
    });
    if (isbnExists) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.error("Error parsing JSON: " + e);
    return null;
  }
};
