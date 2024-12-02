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
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [userDetails, setUserDetails] = useState();
  const [checkedBooks, setCheckedBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);

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

  const handleSave = () => {
    handleBookUpload();
  };

  const handleBookSearch = async () => {
    setSearchedBooks([]);
    let works = [];
    let editions = [];

    // Create an array of promises for API calls
    const fetchPromises = [];
    for (let i = 1; i < 3; i++) {
      const promise = new Promise((resolve) => {
        httpGetAsync(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(
            bookSearch
          )}&sort=editions&page=${i}&fields=ratings_average,ratings_count,author_name,author_key,edition_count,edition_key,key&language=eng`,
          (response) => {
            if (response) {
              const sortedResults = response.docs.filter(
                (result) => result.ratings_count
              );
              sortedResults.forEach((result) => {
                let foundSpot = false;
                for (let j = 0; j < works.length; j++) {
                  if (result.ratings_count >= works[j].ratings_count) {
                    works.splice(j, 0, result);
                    foundSpot = true;
                    break;
                  }
                }
                if (!foundSpot) works.push(result);
              });
            } else {
              setScanState("Book Not Found");
            }
            resolve();
          }
        );
      });
      fetchPromises.push(promise);
    }

    await Promise.all(fetchPromises);
    fetchPromises.length = 0;

    for (let i = 0; i < works.length; i++) {
      let promise = new Promise((resolve) => {
        httpGetAsync(
          `https://openlibrary.org${works[i].key}/editions.json`,
          async (response) => {
            if (response) {
              for (let j = 0; j < response.entries.length; j++) {
                if (
                  response.entries[j].languages &&
                  response.entries[j].languages[0].key == "/languages/eng" &&
                  response.entries[j].covers
                ) {
                  editions.push(response.entries[j]);
                }
              }
            }
            resolve();
          }
        );
      });
      fetchPromises.push(promise);
    }

    await Promise.all(fetchPromises);

    if (editions.length == 0) {
      setScanModalStatus("Couldn't Find Any Titles for That Search");
    } else {
      setScanModalStatus(`Found Titles for That Search`);
    }

    editions.sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      const targetTitle = bookSearch.toLowerCase();

      // 1. Exact matches get the highest priority
      const isExactMatchA = titleA === targetTitle;
      const isExactMatchB = titleB === targetTitle;
      if (isExactMatchA && !isExactMatchB) return -1; // `a` goes first
      if (!isExactMatchA && isExactMatchB) return 1; // `b` goes first

      // 2. Titles that contain the target but aren't exact matches
      const containsTitleA = titleA.includes(targetTitle);
      const containsTitleB = titleB.includes(targetTitle);
      if (containsTitleA && !containsTitleB) return -1; // `a` goes first
      if (!containsTitleA && containsTitleB) return 1; // `b` goes first

      // 3. Push editions with "box set" or similar keywords to the bottom
      const isBoxSetA = /box set|collection|set of/i.test(titleA);
      const isBoxSetB = /box set|collection|set of/i.test(titleB);
      if (isBoxSetA && !isBoxSetB) return 1; // `b` goes first
      if (!isBoxSetA && isBoxSetB) return -1; // `a` goes first

      const extractNumber = (title) => {
        const match = title.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : Infinity; // Return Infinity if no number is found
      };

      const numberA = extractNumber(titleA);
      const numberB = extractNumber(titleB);

      if (numberA !== numberB) {
        return numberA - numberB; // Prioritize lower numbers
      }

      if (a.covers && !b.covers) return 1;
      if (!a.covers && b.covers) return -1;

      // 4. Fallback: Alphabetical sorting for stability
      return titleA.localeCompare(titleB);
    });
    console.log(editions);
    let books = [];
    for (let i = 0; i < 20; i++) {
      let currEdition = editions[i];
      if (currEdition && currEdition.title) {
        books.push({
          title: currEdition.title || "Unknown Title",
          authors:
            currEdition.authors && currEdition.authors.length > 0
              ? currEdition.authors[0].key
              : "Unknown Author",
          genres: currEdition.subjects
            ? currEdition.subjects
            : currEdition.genres
            ? currEdition.genres
            : [],
          covers: currEdition.covers
            ? [
                `https://covers.openlibrary.org/b/id/${currEdition.covers[0]}-S.jpg`,
                `https://covers.openlibrary.org/b/id/${currEdition.covers[0]}-M.jpg`,
                `https://covers.openlibrary.org/b/id/${currEdition.covers[0]}-L.jpg`,
              ]
            : [],
          isbn: currEdition.isbn_13
            ? currEdition.isbn_13[0]
            : currEdition.isbn_10
            ? currEdition.isbn_10[0]
            : "Unknown ISBN",
        });
      }
    }
    console.log(books);
    createBooksForSearch(books);
  };

  const createBooksForSearch = (books) => {
    for (let book in books) {
      setSearchedBooks((previousBooks) => {
        return [
          ...previousBooks,
          new Book(
            books[book].title,
            books[book].authors,
            books[book].genres,
            books[book].covers,
            [],
            books[book].isbn,
            false,
            ID.unique()
          ),
        ];
      });
    }
  };

  useEffect(() => {
    setCheckedBooks(new Array(searchedBooks.length).fill(false));
  }, [searchedBooks]);

  useEffect(() => {
    console.log("Checked books from createBooks: " + checkedBooks);
  }, [checkedBooks]);

  const addSearchedBooks = () => {
    console.log(searchedBooks.length);
    console.log(checkedBooks);
    for (let i = 0; i < searchedBooks.length; i++) {
      if (checkedBooks[i] == true) {
        console.log("Adding book");
        setSelectedBooks((prevBooks) => {
          return [...prevBooks, searchedBooks[i]];
        });
        setCheckedBooks((prevBooks) => {
          let newBooks = prevBooks;
          newBooks[i] = false;
          return newBooks;
        });
      }
    }
  };

  const handleBookUpload = async () => {
    if (selectedBooks && selectedBooks.length > 0) {
      for (let i = 0; i < selectedBooks.length; i++) {
        const checkedBook = await checkForBook(selectedBooks[i].getIsbn());
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
            selectedBooks[i].getId(),
            selectedBooks[i].returnJson()
          );
          console.log("Book added:", response);

          // Update the user's document to include the newly created book
          const userDocument = await databases.getDocument(
            databaseKey,
            usersCollection,
            userDetails.$id
          );

          const updatedBooks = userDocument.books
            ? [...userDocument.books, selectedBooks[i].getId()]
            : [selectedBooks[i].getId()];

          await databases.updateDocument(
            databaseKey,
            usersCollection,
            userDetails.$id,
            { books: updatedBooks }
          );
          console.log("User document updated with new book ID.");
        }
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
              {searchedBooks && searchedBooks.length > 0 ? (
                <>
                  <BookList
                    books={searchedBooks}
                    checkedBooks={checkedBooks}
                    setCheckedBooks={setCheckedBooks}
                  />
                </>
              ) : (
                <></>
              )}
            </div>
            <div
              className="scan_modal_book_search_accept"
              onClick={() => addSearchedBooks()}
            >
              <p>Add</p>
            </div>
          </div>
          <div className="horizontal_alligner">
            <div className="scan_modal_available_tags_container">
              <TagList />
            </div>
            <div className="scan_modal_current_tags_container"></div>
            <div className="scan_modal_selected_books_container">
              <div style={{ fontSize: "1.2rem" }}>Selected Books</div>
              {selectedBooks && selectedBooks.length > 0 ? (
                <BookList books={selectedBooks} />
              ) : (
                <></>
              )}
            </div>
            <div className="scan_modal_add_books_button"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ScanModal;
