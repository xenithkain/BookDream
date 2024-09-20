import { useModal } from "../components/ScanModalContext";
import * as op from "../openlibrary/openlibrary";
import { useState, useEffect, useCallback } from "react";
import Book from "../components/Book";
import BookTile from "./BookTile";
import {
  account,
  databases,
  usersCollection,
  databaseKey,
} from "../appwrite/appwriteConfig";

function ScanModal({ isOpen, books, setBooks, setBookScanned }) {
  const { isScanModalOpen, closeModal, isBulk } = useModal();
  const [userDetails, setUserDetails] = useState();
  const [currentBook, setCurrentBook] = useState(null);
  const [scanState, setScanState] = useState("No Book Scanned");
  const [isbn, setIsbn] = useState("");

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        console.log(isbn);
        createBook(isbn);
        setIsbn(""); // Clear buffer after processing
      } else if (e.key !== "Enter") {
        setIsbn((prevIsbn) => prevIsbn + e.key);
      }
    };

    document.addEventListener("keypress", handleKeyPress);

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  });

  useEffect(() => {
    if (currentBook) {
      handleBookUpload();
    }
  }, [currentBook]);

  useEffect(() => {
    const getData = account.get();
    getData.then(
      (response) => {
        setUserDetails(response);
      },
      (error) => {
        console.log(error);
      }
    );
  }, [currentBook]);

  const handleBookUpload = async () => {
    if (currentBook) {
      let oldBooksString = await op.getBooks();
      let oldBooks = JSON.parse(oldBooksString) || [];
      if (!Array.isArray(oldBooks)) {
        oldBooks = [];
      }

      oldBooks.push(await currentBook.returnJson());
      const newBooksString = JSON.stringify(oldBooks);
      console.log(userDetails.$id);
      const promise = databases.updateDocument(
        databaseKey,
        usersCollection,
        userDetails.$id,
        {
          Name: userDetails.name,
          Books: newBooksString,
        }
      );
      promise.then(
        (response) => {
          console.log("Book saved:", response);
        },
        (error) => {
          console.log("Error saving book:", error);
        }
      );
    }
  };

  const createBook = (isbn) => {
    if (isbn.length > 0 && (isbn.length === 10 || isbn.length === 13)) {
      let newBook = new Book();
      op.httpGetAsync(
        `https://openlibrary.org/isbn/${isbn}.json`,
        async (response) => {
          if (response) {
            const urls = {
              Small: `https://covers.openlibrary.org/b/isbn/${isbn}-S.jpg`,
              Medium: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
              Large: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
            };
            newBook.setIsbn(isbn);
            newBook.setTitle(response.title ? response.title : "");
            newBook.setGenres(
              response.genres
                ? response.genres
                : response.subjects
                ? response.subjects
                : []
            );
            const coverExists =
              (await op.checkImageExists(urls.Small)) ||
              (await op.checkImageExists(urls.Medium)) ||
              (await op.checkImageExists(urls.Large)) ||
              false;
            newBook.setCover(coverExists ? urls : "");
            if (response.authors) {
              const authors = await op.fetchAuthorNames(response.authors);
              newBook.setAuthors(authors);
            }
            let oldBooksString = await op.getBooks();
            let oldBooks = JSON.parse(oldBooksString) || [];
            console.log("hello");
            if (await op.checkForBook(newBook, oldBooks)) {
              setCurrentBook(null);
              setScanState("Book Already Exists");
              return;
            }
            console.log("bye");
            setCurrentBook(newBook);
            setBookScanned(true);
            handleBookUpload();
          } else {
            // Clear book details if no book found
            setCurrentBook(null);
            setScanState("Book Not Found");
          }
        }
      );
    } else {
      // Clear book details if not a valid ISBN
      setCurrentBook(null);
      setScanState("Not an ISBN Number");
    }
  };

  if (isBulk) {
  } else {
  }

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
        {currentBook ? (
          currentBook.title + " was added to your bookshelf!"
        ) : (
          <></>
        )}
        {currentBook ? <BookTile book={currentBook} /> : <></>}
      </div>
    </>
  );
}

export default ScanModal;