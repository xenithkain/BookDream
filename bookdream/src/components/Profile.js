import { useState, useEffect } from "react";
import {
  account,
  databases,
  usersCollection,
  databaseKey,
} from "../appwrite/appwriteConfig";
import { useNavigate } from "react-router-dom";
import Book from "./Book";
import * as op from "../openlibrary/openlibrary";

function Profile() {
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState();
  const [currentBook, setCurrentBook] = useState(null);
  const [isbn, setIsbn] = useState("");
  const [scanState, setScanState] = useState("No Book Scanned");

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
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
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
    const getBooks = async () => {
      try {
        const userDocument = await databases.getDocument(
          databaseKey,
          usersCollection,
          userDetails.$id
        );
        return userDocument?.Books ? userDocument.Books : "[]";
      } catch (error) {
        console.error("Error fetching user document:", error);
        return [];
      }
    };
    let bookSaved = false;

    const handleEnterBook = async () => {
      if (!bookSaved && currentBook) {
        bookSaved = true;
        let oldBooksString = await getBooks();
        let oldBooks = [];

        try {
          oldBooks = JSON.parse(oldBooksString) || [];
          const isbnExists = oldBooks.some((book) => {
            const isbn = Object.keys(book)[0]; // Get the ISBN key from each object
            return isbn === currentBook.getIsbn(); // Check if it matches the ISBN to check
          });
          if (isbnExists) {
            return;
          }
        } catch (e) {
          console.error("Error parsing JSON: " + e);
          oldBooks = [];
        }

        if (!Array.isArray(oldBooks)) {
          oldBooks = [];
        }

        oldBooks.push(currentBook.returnJson());
        const newBooksString = JSON.stringify(oldBooks);

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
            bookSaved = false; // Reset guard after successful save
          },
          (error) => {
            console.log("Error saving book:", error);
            bookSaved = false; // Reset guard on error
          }
        );
      }
    };

    if (currentBook) {
      handleEnterBook();
    }
  }, [userDetails, currentBook]);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };
  const createBook = (isbn) => {
    if (isbn.length > 0 && (isbn.length === 10 || isbn.length === 13)) {
      let newBook = new Book();
      op.httpGetAsync(
        `https://openlibrary.org/isbn/${isbn}.json`,
        async (response) => {
          if (response) {
            const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
            newBook.setTitle(response.title ? response.title : "");
            newBook.setGenres(response.genres ? response.genres : []);
            const coverExists = await op.checkImageExists(url);
            newBook.setCover(coverExists ? url : "");
            if (response.authors) {
              const authors = await op.fetchAuthorNames(response.authors);
              newBook.setAuthors(authors);
            }
            setCurrentBook(newBook);
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

  return (
    <>
      {userDetails ? (
        <>
          <div className="ProfilePage">
            <header>
              <div className="NavBar">
                <h5 className="BoldText">
                  Welcome to Book Dream {userDetails.name}
                </h5>
                <button className="Logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </header>
            <div className="horizontal-align">
              <div className="Lookup-Tile">
                {currentBook ? (
                  <>
                    <h3>Title: {currentBook.getTitle()}</h3>
                    {currentBook.getCover() ? (
                      <img
                        className="coverImage"
                        src={currentBook.getCover()}
                        alt="book_image"
                      />
                    ) : (
                      <h4>No cover available</h4>
                    )}
                    <h4>
                      Authors:{" "}
                      {currentBook.getAuthors().length > 0
                        ? currentBook.getAuthors().join(", ")
                        : "Unknown"}{" "}
                      <br />
                      Genres:{" "}
                      {currentBook.getGenres().length > 0
                        ? currentBook.getGenres().join(", ")
                        : "Unknown"}
                    </h4>
                  </>
                ) : (
                  <h4>{scanState}</h4>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <p>Please Login</p>
          <button onClick={() => navigate("/login")}>Login</button>
        </>
      )}
    </>
  );
}

export default Profile;
