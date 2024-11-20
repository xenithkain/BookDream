import { useScanBookModal } from "../../contexts/ScanModalContext";
import { FaXmark } from "react-icons/fa6";
import { ImCheckmark } from "react-icons/im";
import TagList from "../TagList";

import {
  getBooks,
  checkForBook,
  getTags,
  booksCollection,
  checkIfUserHasBook,
  addBookToUser,
  addBookToDatabase,
} from "../../appwrite/appwriteConfig";
import { ID } from "appwrite";
import {
  httpGetAsync,
  checkImageExists,
  fetchAuthorNames,
} from "../../openlibrary/openlibrary";
import { useState, useEffect } from "react";
import Book from "../Book";
import BookTile from "../BookTile";
import {
  account,
  databases,
  usersCollection,
  databaseKey,
} from "../../appwrite/appwriteConfig";
import Tag from "../Tag";
import { sortList, api_key } from "../utility";
import BookList from "../BookList";

function ScanModal({ isOpen, books, setBooks }) {
  const { isScanModalOpen, closeScanBookModal } = useScanBookModal();
  const [isbn, setIsbn] = useState("");
  const [scannedIsbn, setScaneedIsbn] = useState("");
  const [scanModalStatus, setScanModalStatus] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [searchHasFocus, setSearchHasFocus] = useState(false);
  const [searchType, setSearchType] = useState("Title");

  const [userDetails, setUserDetails] = useState();
  const [currentBook, setCurrentBook] = useState(null);
  const [scanState, setScanState] = useState("No Book Scanned");

  const [scannedBooks, setScannedBooks] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    setScanModalStatus(
      "Please Use the Search Bar To Find A Book, Or Scan A Bar Code."
    );
    const getData = account.get();
    getData.then(
      (response) => {
        setUserDetails(response);
      },
      (error) => {
        console.error(error);
        console.log("There was an error");
      }
    );
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        if (searchHasFocus) {
          handleBookSearch();
        } else {
          setScaneedIsbn(isbn);
          setScanModalStatus("Scanned Book with ISBN: " + isbn);
          createBook(isbn);
          setIsbn("");
        }
      } else if (e.key !== "Enter") {
        if (!searchHasFocus) {
          setIsbn((prevIsbn) => prevIsbn + e.key);
        }
      }
    };

    document.addEventListener("keypress", handleKeyPress);

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  });

  const handleSave = () => {};

  const handleBookSearch = () => {
    let works = [];
    for (let i = 1; i < 3; i++) {
      httpGetAsync(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          bookSearch
        )}&sort=editions&page=${i}&fields=ratings_average,ratings_count,author_name,author_key,
        edition_count,edition_key&language=eng`,
        async (response) => {
          if (response) {
            response.docs.map((result) => {
              let key = result.ratings_count;
              if (key) {
                if (!works.includes(result)) {
                  let foundSpot = false;
                  for (let i = 0; i < works.length; i++) {
                    if (key >= works[i].ratings_count) {
                      works.splice(i, 0, result);
                      foundSpot = true;
                      break;
                    }
                  }
                  if (!foundSpot) works.push(result);
                }
              }
            });
          } else {
            setScanState("Book Not Found");
          }
        }
      );
    }

    console.log(works);
  };

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
        console.log("User document updated with new book ID.");
      }
    }
  };

  useEffect(() => {
    async function fetchTags() {
      let sortedTags = await getTags();
      sortList(sortedTags);
      setTags(sortedTags);
    }
    fetchTags();
  }, [isScanModalOpen]);

  useEffect(() => {}, [currentBook]);

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
      if (checkedBook.authors && checkedBook.authors.length > 0) {
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
    } else {
      setScanModalStatus("Book Already Scanned in This Session");
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
      <div className="scan_modal_screen_overlay">
        <div className="modal_actions">
          <div className="modal_accept_button" onClick={handleSave}>
            <ImCheckmark />
          </div>
          <div className="modal_cancel_button" onClick={closeScanBookModal}>
            <FaXmark />
          </div>
        </div>
        <div
          onClick={(e) => e.stopPropagation()}
          className="scan_modal_container"
        >
          <div className="scan_modal_status">{scanModalStatus}</div>
          <div className="scan_modal_book_search_container">
            <div className="horizontal-alligner">
              <div>Search Type</div>
              <div className="scan_modal_book_search_type">
                <div
                  className={`type_title ${
                    searchType == "Title" ? "type_selected" : ""
                  }`}
                  onClick={() => setSearchType("Title")}
                >
                  Title
                </div>
                <div
                  style={{
                    height: "90%",
                    width: "2px",
                    backgroundColor: "var(--main-color-darker)",
                  }}
                />
                <div
                  className={`type_author ${
                    searchType == "Author" ? "type_selected" : ""
                  }`}
                  onClick={() => setSearchType("Author")}
                >
                  Author
                </div>
              </div>
            </div>
            <div className="horizontal_alligner">
              <label>Name</label>
              <input
                className="scan_modal_book_search"
                type="text"
                placeholder="Search for Book"
                onChange={(newBook) => setBookSearch(newBook.target.value)}
                onFocus={() => setSearchHasFocus(true)}
                onBlur={() => setSearchHasFocus(false)}
              ></input>
            </div>
            <div className="scan_modal_searched_books_container">
              {/* <BookList /> */}
            </div>
          </div>
          <div className="horizontal_alligner">
            <div className="scan_modal_available_tags_container">
              <TagList />
            </div>
            <div className="scan_modal_current_tags_container"></div>
            <div className="scan_modal_selected_books_container">
              <div style={{ fontSize: "1.2rem" }}>Selected Books</div>
              <BookList />
            </div>
            <div className="scan_modal_add_books_button"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ScanModal;
