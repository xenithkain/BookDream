class Book {
  constructor(title = "", authors = [], genres = [], cover = {}, isbn = "") {
    this.title = title;
    this.authors = authors;
    this.genres = genres;
    this.cover = cover;
    this.isbn = isbn;
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

  getCover(size) {
    if (size === "Small") {
      return this.cover.Small;
    } else if (size === "Medium") {
      return this.cover.Medium;
    } else if (size === "Large") {
      return this.cover.Large;
    } else {
      console.error("Not a correct Size");
      return null;
    }
  }

  getIsbn() {
    return this.isbn;
  }

  setTitle(title) {
    this.title = title;
  }

  setAuthors(authors) {
    this.authors = authors;
  }

  setGenres(genres) {
    this.genres = genres;
  }

  setCover(cover) {
    this.cover = cover;
  }

  setIsbn(isbn) {
    this.isbn = isbn;
  }

  returnJson() {
    return {
      [this.isbn]: {
        title: this.title,
        authors: this.authors,
        genres: this.genres,
        cover: this.cover,
      },
    };
  }
}

export default Book;
