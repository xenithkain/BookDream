import { Client, Databases, Account, Query, ID } from "appwrite";
import Classroom from "../components/Classroom";

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("66d8d3da001d5a4c82bb");
export const databaseKey = "66d8d504002297d3436f";
export const account = new Account(client);

export const databases = new Databases(client, databaseKey);

export const usersCollection = "66d8d5a90031df9dac29";
export const booksCollection = "67041ebc0032746cbba0";
export const studentsCollection = "67041ec0003da6255395";
export const classroomsCollection = "67041b1e000e47af29b6";
export const classroombooksCollection = "67041dce002bd96e7527";

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
        return !checkedTags.includes(tagName);
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
    const accountData = await getAccount();

    const userDocument = await databases.getDocument(
      databaseKey,
      usersCollection,
      accountData.$id
    );

    if (!userDocument.books || userDocument.books.length === 0) {
      console.log("No books found for this user.");
      return;
    }

    const bookPromises = userDocument.books.map((book) =>
      databases.getDocument(databaseKey, booksCollection, book.$id)
    );

    const userBooks = await Promise.all(bookPromises);

    let updatedBooks = userBooks.filter((book) => !books.includes(book.$id));

    const response = await databases.updateDocument(
      databaseKey,
      usersCollection,
      accountData.$id,
      {
        books: updatedBooks,
      }
    );
    setBooks(updatedBooks);
    setCheckedBooks([]);
    setCheckedCount(0);
    setSelectMode(false);
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

    if (!userDocument.books || userDocument.books.length === 0) {
      console.log("No books found for this user.");
      return [];
    }

    const bookPromises = userDocument.books.map((book) =>
      databases.getDocument(databaseKey, booksCollection, book.$id)
    );

    const userBooks = await Promise.all(bookPromises);

    return userBooks;
  } catch (error) {
    console.error("Error fetching user books:", error);
    return [];
  }
};

export const checkForBook = async (isbn) => {
  try {
    const response = await databases.listDocuments(
      databaseKey,
      booksCollection,
      [Query.equal("isbn", isbn)]
    );
    if (response.documents.length > 0) {
      return response.documents[0];
    }
    return null;
  } catch (e) {
    console.error("Error fetching Books: " + e);
    return false;
  }
};

export const createClassroomDB = async (classroom) => {
  try {
    // Create the classroom in the database
    const uid = ID.unique(); // Generate a unique ID for the classroom

    const response = await databases.createDocument(
      databaseKey,
      classroomsCollection,
      uid,
      {
        name: classroom.name,
        books: classroom.books,
        color: classroom.color,
      }
    );

    console.log("Classroom created in DB:", response);

    // Update the classroom attribute of each chosen book
    if (classroom.books && classroom.books.length > 0) {
      await Promise.all(
        classroom.books.map(async (bookId) => {
          try {
            // Update the book document with the new classroom ID (only one classroom per book)
            await databases.updateDocument(
              databaseKey,
              booksCollection,
              bookId,
              {
                classrooms: response.$id, // Assign the newly created classroom ID
              }
            );

            console.log(
              `Updated book with ID ${bookId} to include new classroom ID ${response.$id}.`
            );
          } catch (error) {
            console.error(`Error updating book ${bookId}:`, error);
          }
        })
      );
    }

    // Return the classroom object with the new ID
    return new Classroom(
      response.$id,
      classroom.name,
      classroom.books,
      classroom.available_books,
      classroom.checked_out_books,
      classroom.overdue_books,
      classroom.color
    );
  } catch (error) {
    console.error("Error creating classroom in DB:", error);
    throw error; // Optionally rethrow the error for further handling
  }
};

export const fetchClassrooms = async () => {
  try {
    const response = await databases.listDocuments(
      databaseKey,
      classroomsCollection
    );
    if (response.documents.length > 0) {
      return response.documents;
    } else {
      return [];
    }
  } catch (e) {
    console.error("Error fetching classrooms:", e);
    return [];
  }
};

export const doesClassroomHaveOverdue = async (classroom) => {
  classroom.available_books.array.forEach((book) => {});
  return [];
};

export const fetchAvailableBooks = async () => {
  try {
    const response = await databases.listDocuments(
      databaseKey,
      booksCollection
    );
    const availableBooks = response.documents.filter(
      (book) => !book.classrooms || book.classrooms.length === 0
    );

    console.log("Fetched books:", availableBooks); // Log filtered available books

    return availableBooks; // Return the filtered array of books
  } catch (error) {
    console.error("Error fetching available books:", error);
    return [];
  }
};

export const checkIfUserHasBook = async (isbn) => {
  try {
    const accountData = await getAccount();
    const userDocument = await databases.getDocument(
      databaseKey,
      usersCollection,
      accountData.$id
    );

    if (!userDocument.books || userDocument.books.length === 0) {
      console.log("No books found for user.");
      return null; // No books exist
    }

    const userBooksPromises = userDocument.books.map((book) =>
      databases.getDocument(databaseKey, booksCollection, book.$id)
    );
    const userBooks = await Promise.all(userBooksPromises);

    // Find the book with the specified ISBN
    const foundBook = userBooks.find((book) => book.isbn === isbn);

    console.log("Book found:", foundBook);
    return foundBook || null; // Return the book if found, otherwise null
  } catch (error) {
    console.error("Error checking if book exists:", error);
    return null; // Return null in case of an error
  }
};
