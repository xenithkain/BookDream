import { useModal } from "../components/ScanModalContext";
import {
  getBooks,
  checkForBook,
  getTags,
  booksCollection,
  checkIfUserHasBook,
  addBookToUser,
  addBookToDatabase,
} from "../appwrite/appwriteConfig";
import { ID } from "appwrite";
import {
  httpGetAsync,
  checkImageExists,
  fetchAuthorNames,
} from "../openlibrary/openlibrary";
import { useState, useEffect } from "react";
import Book from "../components/Book";
import BookTile from "./BookTile";
import {
  account,
  databases,
  usersCollection,
  databaseKey,
} from "../appwrite/appwriteConfig";
import Tag from "./Tag";
import { sortList, api_key } from "./utility";

function ScanModal({ isOpen, books, setBooks, setBookScanned }) {
  const { isScanModalOpen, closeModal, isBulk } = useModal();
  const [userDetails, setUserDetails] = useState();
  const [currentBook, setCurrentBook] = useState(null);
  const [scanState, setScanState] = useState("No Book Scanned");
  const [isbn, setIsbn] = useState("");
  const [scannedBooks, setScannedBooks] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        createBook(isbn);
        setIsbn("");
      } else if (e.key !== "Enter") {
        setIsbn((prevIsbn) => prevIsbn + e.key);
      }
    };

    document.addEventListener("keypress", handleKeyPress);

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  });
  const handleBookUpload = async () => {
    if (currentBook) {
      const checkedBook = await checkForBook(currentBook.getIsbn());
      if (checkedBook != null) {
        const userDocument = await databases.getDocument(
          databaseKey,
          usersCollection,
          userDetails.$id
        );
        console.log("User books: " + userDocument.books);
        const updatedBooks = userDocument.books
          ? [...userDocument.books, checkedBook.$id]
          : [checkedBook.$id];
        console.log("Updated books: " + updatedBooks);
        await databases.updateDocument(
          databaseKey,
          usersCollection,
          userDetails.$id,
          { books: updatedBooks }
        );
        setBookScanned(true);
        console.log("User document updated with new book ID.");
        return;
      } else {
        // Add book to the Books collection
        const response = await databases.createDocument(
          databaseKey,
          booksCollection,
          currentBook.getId(),
          currentBook.returnJson()
        );
        console.log("Book added:", response);

        // Update the user's document to include the newly created book
        const userDocument = await databases.getDocument(
          databaseKey,
          usersCollection,
          userDetails.$id
        );

        const updatedBooks = userDocument.books
          ? [...userDocument.books, currentBook.getId()]
          : [currentBook.getId()];

        await databases.updateDocument(
          databaseKey,
          usersCollection,
          userDetails.$id,
          { books: updatedBooks }
        );
        setBookScanned(true);
        console.log("User document updated with new book ID.");
      }
    }
  };

  useEffect(() => {
    if (currentBook) {
      handleBookUpload();
    }
  }, [currentBook]);

  useEffect(() => {
    async function fetchTags() {
      let sortedTags = await getTags();
      sortList(sortedTags);
      setTags(sortedTags);
    }
    fetchTags();
  }, [isScanModalOpen]);

  useEffect(() => {
    const getData = account.get();
    getData.then(
      (response) => {
        setUserDetails(response);
      },
      (error) => {
        console.error(error);
      }
    );
  }, [currentBook]);

  const createBook = async (isbn) => {
    if (!isbn || (isbn.length !== 10 && isbn.length !== 13)) {
      console.error("Invalid ISBN number provided.");
      return;
    }
    let newBook = new Book();
    const urls = [
      `https://covers.openlibrary.org/b/isbn/${isbn}-S.jpg`,
      `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
      `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
    ];
    const coverExists =
      (await checkImageExists(urls.Small)) ||
      (await checkImageExists(urls.Medium)) ||
      (await checkImageExists(urls.Large)) ||
      false;
    const checkedBook = await checkForBook(isbn);
    if (checkedBook != null) {
      newBook.setIsbn(checkedBook.isbn);
      newBook.setTitle(checkedBook.title || "No Title Given");
      newBook.setGenres(checkedBook.genres || checkedBook.subjects || []);
      newBook.setCover(coverExists ? urls : "");
      newBook.setTags(selectedTags.map((tag) => tag.name));
      newBook.setId(checkedBook.$id);
      if (checkedBook.authors.length > 0) {
        newBook.setAuthors(checkedBook.authors || []);
      }
      console.log("creating book from memeory");
    } else {
      // Fetch book details from OpenLibrary
      httpGetAsync(
        `https://openlibrary.org/isbn/${isbn}.json`,
        async (response) => {
          if (response) {
            // Set book details from response
            newBook.setIsbn(isbn);
            newBook.setTitle(response.title || "No Title Given");
            newBook.setGenres(response.genres || response.subjects || []);

            newBook.setCover(coverExists ? urls : "");
            if (response.authors) {
              const authors = await fetchAuthorNames(response.authors);
              newBook.setAuthors(authors || []);
            }

            newBook.setTags(selectedTags.map((tag) => tag.name)); // Assuming tag.name is a string

            newBook.setId(ID.unique());
            console.log("creating book from new");
          } else {
            setScanState("Book Not Found");
          }
        }
      );
    }
    const userCheckedBook = await checkIfUserHasBook(newBook.getIsbn());
    if (userCheckedBook != null) {
      return;
    }

    // Check against scanned books to prevent duplicates within the session
    const alreadyScanned = scannedBooks.some(
      (scannedBook) => scannedBook.getIsbn() === newBook.getIsbn()
    );

    if (!alreadyScanned) {
      // Add to the current scanned books list
      setScannedBooks((prevScannedBooks) => [newBook, ...prevScannedBooks]);

      // Save book to the database
      setCurrentBook(newBook);
      setBookScanned(true);
    } else {
      setScanState("Book Already Scanned in This Session");
    }
  };

  const handleAddScanTag = (tagName) => {
    const tagToAdd = tags.find((tag) => tag.name === tagName);
    if (tagToAdd) {
      const updatedTags = tags.filter((tag) => tag.name !== tagName);

      const updatedSelectedTags = [...selectedTags, tagToAdd];
      sortList(updatedTags);
      sortList(updatedSelectedTags);
      setTags(updatedTags);
      setSelectedTags(updatedSelectedTags);
    }
  };

  const handleRemoveScanTag = (tagName) => {
    const tagToAdd = selectedTags.find((tag) => tag.name === tagName);
    if (tagToAdd) {
      const updatedSelectedTags = selectedTags.filter(
        (tag) => tag.name !== tagName
      );

      const updatedTags = [...tags, tagToAdd];
      sortList(updatedTags);
      sortList(updatedSelectedTags);
      setTags(updatedTags);
      setSelectedTags(updatedSelectedTags);
    }
  };

  if (!isScanModalOpen) return null;

  return (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        className="ScanModelContainer"
        style={{
          position: "absolute",
          left: "${window.innerWidth} - 50vw",
          top: "${window.innerHeight} - 95vh",
          display: isScanModalOpen ? "block" : "none",
        }}
      >
        <div className="ScanTagContainer">
          <p>Tags to Add</p>
          <div className="TagList">
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
              );
            })}
          </div>
        </div>
        <div className="ScanTagContainer">
          <p>Tags</p>
          <div className="TagList">
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
              );
            })}
          </div>
        </div>
        {currentBook ? (
          currentBook.title + " was added to your bookshelf!"
        ) : (
          <></>
        )}
        <div className="ScannedBooksContainer">
          {scannedBooks.length > 0 ? (
            scannedBooks.map((book, index) => {
              const isbn = Object.keys(book)[0];
              return <BookTile key={index} book={book} />;
            })
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}

export default ScanModal;
