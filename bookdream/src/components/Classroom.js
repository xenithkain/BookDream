import Student from "./Student";
import Book from "./Book";

class Classroom {
  constructor(id = "", name = "", students = [], books = [], color = "") {
    this.name = name; // Internal variable to store name
    this.students = students; // Internal variable to store students
    this.books = books; // Internal variable to store books
    this.id = id;
    this.color = color;
  }

  // Getter for name
  getName() {
    return this.name;
  }

  getColor() {
    return this.color;
  }

  getId() {
    return this.id;
  }

  // Getter for students
  getStudents() {
    return this.students;
  }

  // Getter for books
  getBooks() {
    return this.books;
  }

  // Setter for name
  setName(newName) {
    this.name = newName; // Set the internal variable
  }

  setId(newId) {
    this.id = newId;
  }

  setColor(newColor) {
    this.color = newColor;
  }

  // Setter for books
  setBooks(newBooks) {
    this.books = newBooks; // Set the internal variable
  }

  setStudents(newStudents) {
    this.students = newStudents;
  }

  // Method to add a student
  addStudent(newStudent) {
    this.students.push(newStudent);
  }

  // Method to add a book
  addBook(newBook) {
    this.books.push(newBook); // Fixed variable name to _books
  }
}

export default Classroom;
