class Book {
  constructor (
    title = '',
    authors = [],
    genres = [],
    cover = [],
    tags = [],
    isbn = ''
  ) {
    this.title = title
    this.authors = authors
    this.genres = genres
    this.cover = cover
    this.tags = tags
    this.isbn = isbn
  }

  getTitle () {
    return this.title
  }

  getAuthors () {
    return this.authors
  }

  getGenres () {
    return this.genres
  }

  getCover (size) {
    if (size === 'Small') {
      return this.cover[0]
    } else if (size === 'Medium') {
      return this.cover[1]
    } else if (size === 'Large') {
      return this.cover[2]
    } else {
      console.error('Not a correct Size')
      return null
    }
  }

  getTags () {
    return this.tags
  }

  getIsbn () {
    return this.isbn
  }

  setTitle (title) {
    this.title = title
  }

  setAuthors (authors) {
    this.authors = authors
  }

  setGenres (genres) {
    this.genres = genres
  }

  setCover (cover) {
    this.cover = cover
  }

  setTags (tags) {
    this.tags = tags
  }

  setIsbn (isbn) {
    this.isbn = isbn
  }

  returnJson () {
    return {
      title: this.title,
      authors: this.authors,
      genres: this.genres,
      covers: this.cover,
      tags: this.tags,
      isbn: this.isbn
    }
  }
}

export default Book
