import { useAddClassroomModal } from "../components/AddClassroomModalContext"; // Adjust the path if necessary
import AddClassroomModal from "../components/AddClassroomModal";
import {
  getBooks,
  getTags,
  account,
  fetchAvailableBooks,
  createClassroomDB,
  fetchClassrooms,
} from "../appwrite/appwriteConfig";
import { useEffect, useState } from "react";
import Classroom from "../components/Classroom";

function ClassroomsPage() {
  const { isAddClassroomModalOpen, closeModal, openModal } =
    useAddClassroomModal();
  const [userDetails, setUserDetails] = useState();
  const [availableBooks, setAvailableBooks] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  const handleAddClassroomClick = () => {
    openModal();
  };

  useEffect(() => {
    const getAvailableBooks = async () => {
      const books = await fetchAvailableBooks();
      setAvailableBooks(books);
    };

    const getClassrooms = async () => {
      const c = await fetchClassrooms();
      setClassrooms(c);
    };

    getAvailableBooks();
    getClassrooms(); // Fetch classrooms on initial load
  }, []);

  const createClassroom = async (name, color, chosenBooks) => {
    // Check if a classroom with the same name already exists
    const classroomExists = classrooms.some(
      (classroom) => classroom._name === name
    );

    if (classroomExists) {
      console.log("Classroom already exists:", name);
      return; // Exit the function if the classroom already exists
    }

    let c = new Classroom(name, [], chosenBooks);
    console.log("Current Classrooms:", classrooms);
    console.log("New Classroom:", c);

    // Update local state
    setClassrooms((prevClassrooms) => {
      console.log("Prev Classrooms:", prevClassrooms);
      const updatedClassrooms = [...prevClassrooms, c];
      console.log("New Classrooms:", updatedClassrooms);
      return updatedClassrooms;
    });

    // Add the classroom to the database
    await createClassroomDB(c); // Ensure this is awaited for consistency
    console.log("Classroom Created:", { name, color, chosenBooks });
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await account.get();
        setUserDetails(response);
      } catch (error) {
        console.error(error);
      }
    };
    getData();
  }, []);

  return (
    <>
      <button className="AddButton" onClick={handleAddClassroomClick}>
        +
      </button>

      {isAddClassroomModalOpen && (
        <AddClassroomModal onSave={createClassroom} books={availableBooks} />
      )}
    </>
  );
}

export default ClassroomsPage;
