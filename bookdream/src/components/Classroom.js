import Student from "./Student";
import Book from "./Book";

class Classroom {
  constructor(name = "", students = [], books = []) {
    this._name = name; // Internal variable to store name
    this._students = students; // Internal variable to store students
    this._books = books; // Internal variable to store books
  }

  // Getter for name
  get name() {
    return this._name;
  }

  // Getter for students
  get students() {
    return this._students;
  }

  // Getter for books
  get books() {
    return this._books;
  }

  // Setter for name
  set name(newName) {
    this._name = newName; // Set the internal variable
  }

  // Setter for books
  set books(newBooks) {
    this._books = newBooks; // Set the internal variable
  }

  // Method to add a student
  addStudent(newStudent) {
    this._students.push(newStudent);
  }

  // Method to add a book
  addBook(newBook) {
    this._books.push(newBook); // Fixed variable name to _books
  }
}

export default Classroom;
