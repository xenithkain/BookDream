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

export const removeTag = async (tag) => {
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
        return !tag.name.includes(tagName);
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
    userDocument.Tags
      ? (tagsArray = JSON.parse(userDocument.Tags))
      : (tagsArray = []);

    return tagsArray;
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

export const checkoutBookFromClassroom = async (classroom, isbn, studentId) => {
  try {
    const books = await Promise.all(
      classroom.books.map(async (id) => {
        const response = await databases.getDocument(
          databaseKey,
          booksCollection,
          id
        );
        return response &&
          response.isbn === isbn &&
          response.classrooms.$id === classroom.id &&
          !response.checked_out
          ? response
          : null;
      })
    );
    let book = books.find((book) => book !== null) || null;
    console.log("book:", book);
    let dates = book.checked_out_dates;
    dates.push(new Date());
    let checked_out_by_list = book.checked_out_by;
    checked_out_by_list.push(studentId);
    let overdue_date = new Date(checked_out_by_list[0]);
    overdue_date.setDate(overdue_date.getDate() + 7);
    databases.updateDocument(databaseKey, booksCollection, book.$id, {
      checked_out: true,
      checked_out_by: checked_out_by_list,
      checked_out_dates: dates,
      overdue_date: overdue_date,
    });
    let student = await databases.getDocument(
      databaseKey,
      studentsCollection,
      studentId
    );
    let student_books = student.checked_out_books;
    student_books.push(book.$id);
    databases.updateDocument(databaseKey, studentsCollection, studentId, {
      checked_out_books: student_books,
    });
    return book;
  } catch (error) {
    console.error("Error checking out book:", error);
    return null;
  }
};

export const createClassroomDB = async (classroom) => {
  try {
    // Create the classroom in the database
    let newBooks = [];
    classroom.books.forEach((book) => {
      newBooks.push(book.id);
    });

    const response = await databases.createDocument(
      databaseKey,
      classroomsCollection,
      classroom.id,
      {
        name: classroom.name,
        books: newBooks,
        color: classroom.color,
        students: classroom.students,
      }
    );

    // Update the classroom attribute of each chosen book
    if (classroom.books && classroom.books.length > 0) {
      await Promise.all(
        classroom.books.map(async (book) => {
          try {
            // Update the book document with the new classroom ID (only one classroom per book)
            await databases.updateDocument(
              databaseKey,
              booksCollection,
              book.id,
              {
                classrooms: classroom.id, // Assign the newly created classroom ID
              }
            );

            console.log(
              `Updated book with ID ${book} to include new classroom ID ${classroom.id}.`
            );
          } catch (error) {
            console.error(`Error updating book ${book}:`, error);
          }
        })
      );
    }
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

export const getOverdueBooks = async (classroom) => {
  if (!classroom.books || !Array.isArray(classroom.books)) {
    return []; // Ensure `classroom.books` exists and is an array
  }
  let overdueBooks = await Promise.all(
    classroom.books.map(async (bookId) => {
      try {
        let bookDB = await databases.getDocument(
          databaseKey,
          booksCollection,
          bookId
        );
        if (bookDB.overdue) {
          return bookDB;
        } else {
          return null;
        }
      } catch (error) {
        console.error(`error fetching book ${bookId}`, error);
        return null;
      }
    })
  );
  return overdueBooks.filter((book) => book !== null);
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

export const createStudentsDB = async (student_names, classroom_id) => {
  let student_ids = await Promise.all(
    student_names.map(async (student_name) => {
      try {
        const student = await databases.createDocument(
          databaseKey,
          studentsCollection,
          ID.unique(),
          {
            name: student_name,
            classroom: classroom_id,
          }
        );
        return student.$id;
      } catch (error) {
        console.error(`Error creating student "${student_name}":`, error);
        return null; // Handle failed student creation gracefully
      }
    })
  );

  // Filter out any failed creations (if any)
  return student_ids.filter((id) => id !== null);
};

export const getStudents = async (ids) => {
  // Create an array of promises for the database calls
  if (ids.length > 1) {
    const promises = ids.map((id) => {
      databases.getDocument(databaseKey, studentsCollection, id);
    });

    // Wait for all promises to resolve and return the results
    const students = await Promise.all(promises);
    // Filter out null responses (if any)
    return students.filter((student) => student !== null);
  } else {
    const promise = databases.getDocument(
      databaseKey,
      studentsCollection,
      ids[0]
    );

    const student = await promise;
    return student;
  }
};
