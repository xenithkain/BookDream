import Student from './Student'
import Book from './Book'

class Classroom {
  constructor (name = '', students = [], availableBooks = []) {
    this.name = name
    this.students = students
    this.availableBooks = availableBooks
  }

  get name () {
    return this.name
  }
  get students () {
    return this.students
  }
  get availableBooks () {
    return this.availableBooks
  }
  set name (newName) {
    return this.name
  }

  addStudent (newStudent) {
    this.students.push(newStudent)
  }

  addBook (newBook) {
    this.availableBooks.push(newBook)
  }
}

export default Classroom
