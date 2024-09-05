import { useState, useEffect } from 'react';
import { account, databases, usersCollection, databaseKey } from '../appwriteConfig';
import { useNavigate } from 'react-router-dom';
import { ID } from 'appwrite';


class Book {
    constructor(title, authors, genres) {
      this.title = title;
      this.authors = authors;
      this.genres = genres;
    }
    getTitle() {
      return this.title;
    }
    getAuthors() {
      return this.authors;
    }
    getGenres() {
      return this.genres;
    }
    returnJson(){
        return ({
            title: this.title,
            authors: this.authors,
            genres: this.genres,
        });
    }
  }

function Profile(){
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState();

    useEffect(() => {
        const getData = account.get();
        getData.then(
            (response) =>{
                setUserDetails(response);
            },
            (error) =>{
                console.log(error);
            }
        );
    }, []);
    const handleLogout = async () => {
        try{
            await account.deleteSession("current");
            navigate("/");
        }catch (error){
            console.log(error);
        }
    }
    const goToLogin = () => {
        navigate("/login");
    }

    // const [bookToAdd, setBookToAdd] = useState();
    const [currentBook, setCurrentBook] = useState(null);
    const [isbn, setIsbn] = useState('');
    const [coverUrl, setCoverUrl] = useState(null);
    const [authorNames, setAuthorNames] = useState([]);
    const [scanState, setScanState] = useState('No Book Scanned');
  
    useEffect(() => {
      const handleKeyPress = (e) => {
        if (e.key === "Enter") {
          getIsbn(isbn);
          setIsbn(''); // Clear buffer after processing
        } else if (e.key !== "Enter") {
          setIsbn((prevIsbn) => prevIsbn + e.key);
        }
      };
  
      document.addEventListener('keypress', handleKeyPress);
      
      return () => {
        document.removeEventListener('keypress', handleKeyPress);
      };
    });
  

    const handleEnterBook = () => { 
        const promise = databases.createDocument(databaseKey, usersCollection, ID.unique(), {
            isbn
        });
        promise.then(
            (response) => {
                console.log('Book saved:', response);
            },
            (error) => {
                console.log('Error saving book:', error);
            }
        );
    };
    const getIsbn = (isbn) => {
      if (isbn.length > 0 && (isbn.length === 10 || isbn.length === 13)) {
        handleEnterBook();
        httpGetAsync(`https://openlibrary.org/isbn/${isbn}.json`, (response) => {
          if (response) {
            const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
            checkImageExists(url).then(exists => {
              if (exists) {
                setCoverUrl(url);
              } else {
                setCoverUrl(null);
              }
            });
  
            // Fetch author names
            if (response.authors) {
              fetchAuthorNames(response.authors);
            }
  
            setCurrentBook(new Book(
              response.title ? response.title : '',
              response.authors ? response.authors.map(author => author.key) : [],
              response.genres ? response.genres : []
            ));
            setScanState(''); // Clear scan state
          } else {
            // Clear book details if no book found
            setCurrentBook(null);
            setCoverUrl(null);
            setScanState('Book Not Found');
          }
        });
      } else {
        // Clear book details if not a valid ISBN
        setCurrentBook(null);
        setCoverUrl(null);
        setScanState('Not an ISBN Number');
      }
    };
  
    function httpGetAsync(theUrl, callback) {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4) {
          if (xmlHttp.status === 200) {
            callback(JSON.parse(xmlHttp.responseText)); // Parse JSON response
          } else {
            callback(null); // Handle error case
          }
        }
      };
      xmlHttp.open("GET", theUrl, true); // true for asynchronous 
      xmlHttp.send(null);
    }
  
    async function checkImageExists(url) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        console.error("Error checking image existence", error);
        return false;
      }
    }
  
    async function fetchAuthorNames(authors) {
      try {
        const names = await Promise.all(authors.map(async (author) => {
          const response = await fetch(`https://openlibrary.org${author.key}.json`);
          const authorData = await response.json();
          return authorData.name;
        }));
        setAuthorNames(names);
      } catch (error) {
        console.error("Error fetching author names", error);
      }
    }
    return(
        <>
        {userDetails ? (
            <>
                <div className="App">
                    <div className='bookTile'>
                    {coverUrl ? (
                        <img className="coverImage" src={coverUrl} alt="book_image" />
                    ) : (
                        <p>No cover available</p>
                    )}
                    {currentBook ? (
                        <p>
                        Title: {currentBook.getTitle()} <br />
                        Authors: {authorNames.length > 0 ? authorNames.join(', ') : 'Unknown'} <br />
                        Genres: {currentBook.getGenres().length > 0 ? currentBook.getGenres().join(', ') : 'Unknown'}
                        </p>
                    ) : (
                        <p>{scanState}</p>
                    )}
                    </div>
                    <button onClick={handleEnterBook}>Enter Book</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </>
        ) : (
            <>
            <p>Please Login</p>
            <button onClick={goToLogin}>Login</button>
            </>
        )};
        </>
        
    );
}

export default Profile
