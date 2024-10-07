class Book {
  constructor(
    title = "",
    authors = [],
    genres = [],
    cover = {},
    tags = [],
    isbn = ""
  ) {
    this.title = title;
    this.authors = authors;
    this.genres = genres;
    this.cover = cover;
    this.tags = tags;
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

  getTags() {
    return this.tags;
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

  setTags(tags) {
    this.tags = tags;
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
        tags: this.tags,
      },
    };
  }
}

export default Book;
