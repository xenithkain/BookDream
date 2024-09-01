import './App.css';
import { useState, useEffect } from 'react';

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
}

function App() {
  let [currentBook, setCurrentBook] = useState(null);
  let [isbn, setIsbn] = useState('');
  let [coverUrl, setCoverUrl] = useState(null);
  let [authorNames, setAuthorNames] = useState([]);
  let [scanState, setScanState] = useState('No Book Scanned');

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
  }, [isbn]);

  const getIsbn = (isbn) => {
    if (isbn.length > 0 && (isbn.length === 10 || isbn.length === 13)) {
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

  return (
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
    </div>
  );
}

export default App;
