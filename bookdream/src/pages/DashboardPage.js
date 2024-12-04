import { UseUserSettings } from "../contexts/UserSettingsContext";
import { useEffect, useState } from "react";
import { LuBookPlus } from "react-icons/lu";
import { MdOutlineDoorFront } from "react-icons/md";
import ClassroomList from "../components/ClassroomList";
import {
  doesClassroomHaveOverdue,
  fetchClassrooms,
  createClassroomDB,
  fetchAvailableBooks,
  getBooks,
} from "../appwrite/appwriteConfig";
import Classroom from "../components/Classroom";
import { useAddClassroomModal } from "../contexts/AddClassroomModalContext";
import AddClassroomModal from "../components/modals/AddClassroomModal";
import { useScanBookModal } from "../contexts/ScanModalContext";
import ScanModal from "../components/modals/ScanModal";
import RecentBook from "../components/RecentBook";

function DashboardPage({ setShowNav }) {
  const { userColors, changeColors } = UseUserSettings();
  const { isAddClassroomModalOpen, closeModal, openModal } =
    useAddClassroomModal();
  const { isScanModalOpen, openScanBookModal, closeScanBookModal } =
    useScanBookModal();
  const [availableBooks, setAvailableBooks] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  useEffect(() => {
    setShowNav(true);
    updateClassrooms();
    getAvailableBooks();
  }, []);

  const [newestBooks, setNewestBooks] = useState([]);

  useEffect(() => {
    const getNewestBooks = async () => {
      let userBooks = await getBooks();
      userBooks.sort((a, b) => {
        const dateA = new Date(a.$createdAt);
        const dateB = new Date(b.$createdAt);

        // Compare dates (newest first)
        return dateB - dateA;
      });
      return userBooks;
    };
    const minuteInterval = setInterval(() => {
      getNewestBooks().then((books) => {
        setNewestBooks(books);
      });
    }, 10000);

    return () => clearInterval(minuteInterval);
  }, []);

  const getAvailableBooks = async () => {
    const books = await fetchAvailableBooks();
    setAvailableBooks(books);
  };

  const createClassroom = async (name, color, chosenBooks, students) => {
    const classroomExists = classrooms.some(
      (classroom) => classroom.name === name
    );

    if (classroomExists) {
      console.log("Classroom already exists:", name);
      return;
    }
    let newClassroom = new Classroom(
      "",
      name,
      students,
      chosenBooks,
      [],
      [],
      color
    );
    newClassroom = await createClassroomDB(newClassroom); // Update with returned classroom
    console.log(newClassroom.students);

    if (newClassroom) {
      // Update local state
      setClassrooms((prevClassrooms) => [...prevClassrooms, newClassroom]);

      getAvailableBooks();
      updateClassrooms();
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
        classroom.overdue_books,
        classroom.color
      );
      createdClassrooms.push(newClassroom);
    });
    if (createdClassrooms != classrooms) setClassrooms(createdClassrooms);
  };
  return (
    <div className="dashboard_page_container">
      <div className="dashboard_title">Book Dream</div>
      <div className="dashboard_page_contents">
        <div className="classrooms_stats_container">
          <div
            className="classrooms_stats_refresh_button"
            onClick={updateClassrooms}
          >
            Refresh
          </div>
          <div className="medium_title classroom_stats_title">Classrooms</div>
          <ClassroomList classrooms={classrooms} />
        </div>
        <div className="recent_books_container">
          <div className="medium_title">Recent Books</div>
          <div className="recent_books_content">
            {newestBooks.map((book, index) => {
              return <RecentBook key={book.$id} book={book} />;
            })}
          </div>
        </div>

        <div className="actions_container">
          <div className="action_scan_book action" onClick={openScanBookModal}>
            <LuBookPlus className="center_icon" />
          </div>
          <div className="action_add_classroom action" onClick={openModal}>
            <MdOutlineDoorFront className="center_icon" />
          </div>
        </div>
      </div>
      {isAddClassroomModalOpen && (
        <AddClassroomModal onSave={createClassroom} books={availableBooks} />
      )}
      {isScanModalOpen && <ScanModal />}
    </div>
  );
}

export default DashboardPage;
