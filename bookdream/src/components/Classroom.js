import Student from "./Student";
import Book from "./Book";

class Classroom {
  constructor(
    id = "",
    name = "",
    students = [],
    available_books = [],
    checked_out_books = [],
    overdue_books = []
  ) {
    this._name = name; // Internal variable to store name
    this._students = students; // Internal variable to store students
    this._available_books = available_books; // Internal variable to store books
    this._checked_out_books = checked_out_books;
    this._overdue_books = overdue_books;
    this._id = id;
  }

  // Getter for name
  get name() {
    return this._name;
  }

  get id() {
    return this._id;
  }

  // Getter for students
  get students() {
    return this._students;
  }

  // Getter for books
  get available_books() {
    return this._available_books;
  }

  get checked_out_books() {
    return this._checked_out_books;
  }

  get overdue_books() {
    return this._overdue_books;
  }

  // Setter for name
  set name(newName) {
    this._name = newName; // Set the internal variable
  }

  set id(newId) {
    this._id = newId;
  }

  // Setter for books
  set available_books(newBooks) {
    this._available_books = newBooks; // Set the internal variable
  }

  set checked_out_books(newBooks) {
    this._checked_out_books = newBooks; // Set the internal variable
  }

  set overdue_books(newBooks) {
    this._overdue_books = newBooks; // Set the internal variable
  }

  // Method to add a student
  addStudent(newStudent) {
    this._students.push(newStudent);
  }

  // Method to add a book
  addBook(newBook) {
    this._available_books.push(newBook); // Fixed variable name to _books
  }
}

export default Classroom;
