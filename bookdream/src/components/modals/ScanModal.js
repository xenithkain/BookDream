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
import SelectedBookList from "../SelectedBooksList";

function ScanModal({ isOpen, books, setBooks }) {
  const { isScanModalOpen, closeScanBookModal } = useScanBookModal();
  const [isbn, setIsbn] = useState("");
  const [scannedIsbn, setScaneedIsbn] = useState("");
  const [scanModalStatus, setScanModalStatus] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [searchHasFocus, setSearchHasFocus] = useState(false);
  const [searchType, setSearchType] = useState("Title");
  const [userDetails, setUserDetails] = useState();

  const [searchedBooks, setSearchedBooks] = useState([]);
  const [checkedBooks, setCheckedBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [checkedSelectedBooks, setCheckedSelectedBooks] = useState([]);

  const [searchedWorks, setSearchedWorks] = useState([]);
  const [workSelected, setWorkSelected] = useState(false);
  const [chosenWork, setChosenWork] = useState();

  const [currentBook, setCurrentBook] = useState(null);
  const [scanState, setScanState] = useState("No Book Scanned");

  const [scannedBooks, setScannedBooks] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    setSearchedBooks([]); // Clear the array on component mount
  }, []);

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
          if (workSelected) handleGoBackToWorks();
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

  const bookGenres = [
    "Fantasy",
    "Fiction",
    "Non fiction",
    "Science Fiction",
    "Mystery",
    "Thriller",
    "Romance",
    "Historical Fiction",
    "Young Adult",
    "Dystopian",
    "Adventure",
    "Contemporary",
    "Horror",
    "Paranormal",
    "Biography",
    "Memoir",
    "Self-Help",
    "Cookbooks",
    "Graphic Novels",
    "Short Stories",
    "Classic Literature",
    "Poetry",
    "Crime",
    "Urban Fantasy",
    "LGBTQ+",
    "Children's",
    "Middle Grade",
    "Juvenile Fiction",
    "Picture Books",
    "Early Readers",
    "Chapter Books",
    "Fairy Tales",
    "Fables",
    "Mythology",
    "Magical Realism",
    "Historical Romance",
    "Chick Lit",
    "Humor",
    "Satire",
    "Autobiography",
    "True Crime",
    "Dark Fantasy",
    "Psychological Thriller",
    "Time Travel",
    "Education",
    "Science",
    "Nature",
    "Sports",
    "Military",
    "War",
    "Travel",
    "Philosophy",
    "Essays",
    "Anthologies",
    "Spirituality",
    "Political",
    "Technology",
    "School Life",
    "Wizards",
    "Magic",
    "Supernatural",
  ];

  const filterGenres = (genres) => {
    let newGenres = [];

    for (let genre of genres) {
      console.log("checking genre: " + genre);
      if (bookGenres.includes(genre)) {
        newGenres.push(genre);
      }
    }
    return newGenres;
  };

  const handleSave = () => {
    handleBookUpload();
    closeScanBookModal();
  };

  useEffect(() => {
    let fetchEditions = async () => {
      let editions = [];
      const fetchPromises = [];
      if (workSelected) {
        let promise = new Promise((resolve) => {
          httpGetAsync(
            `https://openlibrary.org${chosenWork.key}/editions.json`,
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

        await Promise.all(fetchPromises);

        if (editions.length == 0) {
          setScanModalStatus("Couldn't Find Any Titles for That Search");
        } else {
          setScanModalStatus(`Found Titles for That Search`);
        }

        editions.sort((a, b) => {
          let count_a = 0;
          let count_b = 0;
          const titleA = a.title.toLowerCase();
          const titleB = b.title.toLowerCase();
          const targetTitle = bookSearch.toLowerCase();

          // 1. Exact matches get the highest priority
          const isExactMatchA = titleA === targetTitle;
          const isExactMatchB = titleB === targetTitle;
          if (isExactMatchA && !isExactMatchB) count_a++; // `a` goes first
          if (!isExactMatchA && isExactMatchB) count_b++; // `b` goes first

          // 2. Titles that contain the target but aren't exact matches
          const containsTitleA = titleA.includes(targetTitle);
          const containsTitleB = titleB.includes(targetTitle);
          if (containsTitleA && !containsTitleB) count_a++; // `a` goes first
          if (!containsTitleA && containsTitleB) count_b++; // `b` goes first

          const hasFormatA = a.physical_format ? true : false;
          const hasFormatB = b.physical_format ? true : false;
          if (hasFormatA && !hasFormatB) count_a++;
          if (!hasFormatA && hasFormatB) count_b++;

          const hasAuthorsA = a.authors && a.authors.length > 0;
          const hasAuthorsB = b.authors && b.authors.length > 0;
          if (hasAuthorsA && !hasAuthorsB) count_a++;
          if (!hasAuthorsA && hasAuthorsB) count_b++;

          const hasGenresA = a.genres && a.genres.length > 0;
          const hasGenresB = b.genres && b.genres.length > 0;
          if (hasGenresA && !hasGenresB) count_a++;
          if (!hasGenresA && hasGenresB) count_b++;

          // 3. Push editions with "box set" or similar keywords to the bottom
          const isBoxSetA = /box set|collection|set of/i.test(titleA);
          const isBoxSetB = /box set|collection|set of/i.test(titleB);
          if (isBoxSetA && !isBoxSetB) count_b++; // `b` goes first
          if (!isBoxSetA && isBoxSetB) count_a++; // `a` goes first

          const extractNumber = (title) => {
            const match = title.match(/(\d+)/);
            return match ? parseInt(match[1], 10) : Infinity; // Return Infinity if no number is found
          };

          const numberA = extractNumber(titleA);
          const numberB = extractNumber(titleB);

          if (numberA !== numberB) {
            return numberA - numberB; // Prioritize lower numbers
          }

          if (a.covers && !b.covers) count_a++;
          if (!a.covers && b.covers) count_b++;

          // 4. Fallback: Alphabetical sorting for stability
          if (count_a > count_b) return -1;
          if (count_a < count_b) return 1;
          return titleA.localeCompare(titleB);
        });
        //console.log(editions);
        let books = [];
        for (let i = 0; i < 20; i++) {
          let currEdition;
          if (editions[i]) {
            currEdition = editions[i];
          } else {
            continue;
          }
          if (currEdition.title) {
            books.push({
              title: currEdition.title || "Unknown Title",
              authors:
                currEdition.authors && currEdition.authors.length > 0
                  ? await fetchAuthorNames(currEdition.authors)
                  : [],
              genres: chosenWork.subject
                ? filterGenres(chosenWork.subject)
                : currEdition.subjects
                ? filterGenres(currEdition.subjects)
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
                : "",
              format: currEdition.physical_format
                ? currEdition.physical_format
                : "",
            });
          }
        }
        console.log("Editions: ", books);
        console.log("Chosen Work: ", chosenWork);
        createBooksForSearch(books);
      }
    };

    fetchEditions();
  }, [workSelected]);

  const handleBookSearch = async () => {
    setSearchedWorks([]);
    let works = [];
    // Create an array of promises for API calls
    const fetchPromises = [];
    for (let i = 1; i < 3; i++) {
      const promise = new Promise((resolve) => {
        httpGetAsync(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(
            bookSearch
          )}&sort=editions&page=${i}&fields=ratings_average,ratings_count,author_name,author_key,edition_count,edition_key,key,subject,title,cover_edition_key&language=eng`,
          (response) => {
            if (response) {
              const sortedResults = response.docs.filter(
                (result) =>
                  result.ratings_count &&
                  result.ratings_average &&
                  result.author_name &&
                  result.author_key &&
                  result.edition_count &&
                  result.edition_key &&
                  result.key &&
                  result.title &&
                  result.cover_edition_key
              );
              sortedResults.sort((a, b) => {
                let a_count = 0;
                let b_count = 0;
                const targetTitle = bookSearch.toLowerCase();
                if (a.edition_count >= b.edition_count) a_count++;
                if (a.edition_count < b.edition_count) b_count++;

                if (a.ratings_count >= b.ratings_count) a_count++;
                if (a.ratings_count < b.ratings_count) b_count++;

                if (a.ratings_average >= b.ratings_average) a_count++;
                if (a.ratings_average < b.ratings_average) b_count++;

                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();

                // 1. Exact matches get the highest priority
                const isExactMatchA = titleA === targetTitle;
                const isExactMatchB = titleB === targetTitle;
                if (isExactMatchA && !isExactMatchB) a_count++; // `a` goes first
                if (!isExactMatchA && isExactMatchB) b_count++; // `b` goes first

                // 2. Titles that contain the target but aren't exact matches
                const containsTitleA = titleA.includes(targetTitle);
                const containsTitleB = titleB.includes(targetTitle);
                if (containsTitleA && !containsTitleB) a_count++; // `a` goes first
                if (!containsTitleA && containsTitleB) b_count++; // `b` goes first

                if (a_count >= b_count) return -1;
                else return 1;
              });
              works = sortedResults;
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
    console.log("Works: ", works);
    if (works.length == 0) {
      setScanModalStatus("No Works Found");
    } else {
      setScanModalStatus("Found Works");
    }
    setSearchedWorks(works);
  };

  const createBooksForSearch = (books) => {
    for (let book in books) {
      console.log("Book: ", books[book]);
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
    console.log("searchedBooks: ", searchedBooks);
  };

  useEffect(() => {
    setCheckedBooks(new Array(searchedBooks.length).fill(false));
  }, [searchedBooks]);

  useEffect(() => {
    setCheckedSelectedBooks(new Array(searchedBooks.length).fill(false));
  }, [selectedBooks]);

  const addSearchedBooks = () => {
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
          //console.log("User books: " + userDocument.books);
          const updatedBooks = userDocument.books
            ? [...userDocument.books, checkedBook.$id]
            : [checkedBook.$id];
          //console.log("Updated books: " + updatedBooks);
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
          //console.log(selectedBooks[i].authors);
          const response = await databases.createDocument(
            databaseKey,
            booksCollection,
            selectedBooks[i].getId(),
            selectedBooks[i].returnJson()
          );
          //console.log("Book added:", response);

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

  const getWork = async (key) => {
    let work;
    let promise = new Promise((resolve) => {
      httpGetAsync(`https://openlibrary.org${key}.json`, (response) => {
        if (response) {
          work = response;
        } else {
          work = null;
          console.log("couldnt find work");
        }
        resolve();
      });
    });

    await promise;
    console.log(work);
    return work;
  };

  const createBook = async (isbn) => {
    /*
    title: currEdition.title || "Unknown Title",
    authors:
      currEdition.authors && currEdition.authors.length > 0
        ? await fetchAuthorNames(currEdition.authors)
        : [],
    genres: chosenWork.subject
      ? filterGenres(chosenWork.subject)
      : currEdition.subjects
      ? filterGenres(currEdition.subjects)
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
      : "",
    format: currEdition.physical_format
      ? currEdition.physical_format
      : "",
      */

    if (!isbn || (isbn.length !== 10 && isbn.length !== 13)) {
      console.error("Invalid ISBN number provided.");
      return;
    }
    let newBook;
    let promise = new Promise((resolve) => {
      httpGetAsync(
        `https://openlibrary.org/isbn/${isbn}.json`,
        async (response) => {
          if (response) {
            let work = getWork(response.works[0].key);
            console.log(work);
            newBook = new Book(
              response.title
                ? response.title.length < 40
                  ? response.title
                  : response.title.substring(0, 37) + "..."
                : "",
              response.authors && response.authors.length > 0
                ? await fetchAuthorNames(response.authors)
                : [],
              work.subject
                ? filterGenres(work.subject)
                : response.subjects
                ? filterGenres(response.subjects)
                : [],
              response.covers
                ? [
                    `https://covers.openlibrary.org/b/id/${response.covers[0]}-S.jpg`,
                    `https://covers.openlibrary.org/b/id/${response.covers[0]}-M.jpg`,
                    `https://covers.openlibrary.org/b/id/${response.covers[0]}-L.jpg`,
                  ]
                : [],
              [],
              response.isbn_13
                ? response.isbn_13[0]
                : response.isbn_10
                ? response.isbn_10[0]
                : "",
              false,
              ID.unique()
            );
          } else {
            setScanModalStatus("Book Not Found");
          }
          resolve();
        }
      );
    });

    await promise;
    const userCheckedBook = await checkIfUserHasBook(newBook.getIsbn());
    if (userCheckedBook != null) {
      return;
    }

    // Check against scanned books to prevent duplicates within the session
    const alreadyScanned = selectedBooks.some(
      (selectedBook) => selectedBook.getIsbn() === newBook.getIsbn()
    );

    if (!alreadyScanned) {
      // Add to the current scanned books list
      setSelectedBooks((prevSelectedBooks) => [...prevSelectedBooks, newBook]);
      setScanModalStatus(`Scanned ${newBook.title}`);
    } else {
      setScanModalStatus("Book Already Scanned in This Session");
    }
  };

  const handleGoBackToWorks = () => {
    setWorkSelected(false);
    setChosenWork(null);
    setSearchedBooks([]);
    setCheckedBooks([]);
  };

  const handleRemoveSelectedBooks = () => {
    console.log(checkedSelectedBooks);
    for (let i = 0; i < checkedSelectedBooks.length; i++) {
      console.log(checkedSelectedBooks[i], selectedBooks[i]);
      if (checkedSelectedBooks[i]) {
        setSelectedBooks((prev) => prev.filter((_, index) => index !== i));
      }
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
              {workSelected ? (
                searchedBooks && searchedBooks.length > 0 ? (
                  <>
                    <BookList
                      books={searchedBooks}
                      checkedBooks={checkedBooks}
                      setCheckedBooks={setCheckedBooks}
                      workSelected={workSelected}
                      setWorkSelected={setWorkSelected}
                      chosenWork={chosenWork}
                      setChosenWork={setChosenWork}
                    />
                  </>
                ) : (
                  <></>
                )
              ) : searchedWorks && searchedWorks.length > 0 ? (
                <>
                  <BookList
                    books={searchedWorks}
                    workSelected={workSelected}
                    setWorkSelected={setWorkSelected}
                    chosenWork={chosenWork}
                    setChosenWork={setChosenWork}
                  />
                </>
              ) : (
                <></>
              )}
            </div>
            <div className="horizontal_alligner">
              <div
                className="scan_modal_book_search_accept"
                onClick={() => addSearchedBooks()}
              >
                <p>Add</p>
              </div>
              {workSelected ? (
                <div
                  className="scan_modal_book_search_accept"
                  onClick={() => handleGoBackToWorks()}
                >
                  <p>Back</p>
                </div>
              ) : (
                <></>
              )}
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
                <SelectedBookList
                  books={selectedBooks}
                  checkedBooks={checkedSelectedBooks}
                  setCheckedBooks={setCheckedSelectedBooks}
                />
              ) : (
                <></>
              )}
            </div>
            <div
              className="scan_modal_book_search_accept"
              onClick={() => handleRemoveSelectedBooks()}
            >
              <p>Remove</p>
            </div>
            <div className="scan_modal_add_books_button"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ScanModal;
