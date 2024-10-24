import { UseUserSettings } from "../components/UserSettingsContext";
import { useEffect, useState } from "react";
import { LuBookPlus } from "react-icons/lu";
import { MdOutlineDoorFront } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";
import ClassroomList from "../components/ClassroomList";
import {
  doesClassroomHaveOverdue,
  fetchClassrooms,
  createClassroomDB,
  fetchAvailableBooks,
} from "../appwrite/appwriteConfig";
import Classroom from "../components/Classroom";
import { useAddClassroomModal } from "../components/AddClassroomModalContext";
import AddClassroomModal from "../components/AddClassroomModal";

function DashboardPage({ setShowNav }) {
  const { userColors, changeColors } = UseUserSettings();
  const { isAddClassroomModalOpen, closeModal, openModal } =
    useAddClassroomModal();
  const [availableBooks, setAvailableBooks] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  useEffect(() => {
    setShowNav(true);
    updateClassrooms();
  });

  const getAvailableBooks = async () => {
    const books = await fetchAvailableBooks();
    setAvailableBooks(books);
  };

  const createClassroom = async (name, color, chosenBooks) => {
    const classroomExists = classrooms.some(
      (classroom) => classroom.name === name
    );

    if (classroomExists) {
      console.log("Classroom already exists:", name);
      return;
    }

    let newClassroom = new Classroom("", name, [], chosenBooks);
    console.log("New classroom:", newClassroom.name, newClassroom.books);
    newClassroom = await createClassroomDB(newClassroom); // Update with returned classroom

    if (newClassroom) {
      console.log("Updated Classroom:", newClassroom);

      // Update local state
      setClassrooms((prevClassrooms) => [...prevClassrooms, newClassroom]);

      getAvailableBooks();
    }
  };

  const updateClassrooms = async () => {
    let fetchedClassrooms = await fetchClassrooms();
    let createdClassrooms = [];
    fetchedClassrooms.forEach((classroom) => {
      let newClassroom = new Classroom(
        classroom.$id,
        classroom.name,
        classroom.students,
        classroom.books,
        classroom.checked_out_books,
        classroom.overdue_books
      );
      createdClassrooms.push(newClassroom);
    });
    setClassrooms(createdClassrooms);
  };
  return (
    <div className="dashboard_page_container">
      <div className="large_title dashboard_title">Book Dream</div>
      <div className="recent_books_container">
        <div className="medium_title">Recent Books</div>
      </div>
      <div className="classrooms_stats_container">
        <div
          className="classrooms_stats_refresh_button"
          onClick={updateClassrooms}
        >
          X
        </div>
        <div className="medium_title classroom_stats_title">Classrooms</div>
        <ClassroomList classrooms={classrooms} />
      </div>
      <div className="actions_container">
        <div className="action_scan_book action">
          <LuBookPlus className="center_icon" />
        </div>
        <div className="action_add_classroom action" onClick={openModal}>
          <MdOutlineDoorFront className="center_icon" />
        </div>
      </div>
      {isAddClassroomModalOpen && (
        <AddClassroomModal onSave={createClassroom} books={availableBooks} />
      )}
    </div>
  );
}

export default DashboardPage;
