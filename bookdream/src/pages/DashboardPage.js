import { UseUserSettings } from "../contexts/UserSettingsContext";
import { useEffect, useState } from "react";
import { LuBookPlus } from "react-icons/lu";
import { MdOutlineDoorFront } from "react-icons/md";
import { FaTag } from "react-icons/fa6";
import ClassroomList from "../components/ClassroomList";
import {
  doesClassroomHaveOverdue,
  fetchClassrooms,
  createClassroomDB,
  fetchAvailableBooks,
  getBooks,
  createStudentsDB,
  getOverdueBooks,
} from "../appwrite/appwriteConfig";
import Classroom from "../components/Classroom";
import { useAddClassroomModal } from "../contexts/AddClassroomModalContext";
import AddClassroomModal from "../components/modals/AddClassroomModal";
import { useScanBookModal } from "../contexts/ScanModalContext";
import ScanModal from "../components/modals/ScanModal";
import { useTagModal } from "../contexts/TagModalContext";
import TagModal from "../components/modals/TagModal";
import { useCreateCardsModal } from "../contexts/CreateCardsModalContext";
import CreateCardsModal from "../components/modals/CreateCardsModal";
import RecentBook from "../components/RecentBook";
import { ID } from "appwrite";
import { useCheckoutBooksModal } from "../contexts/CheckoutBooksModalContext";
import CheckoutBooksModal from "../components/modals/CheckoutBooksModal";

function DashboardPage({ setShowNav }) {
  const { userColors, changeColors } = UseUserSettings();
  const [overdueBooksMap, setOverdueBooksMap] = useState({}); // Map classroom IDs to overdue book counts
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  const { isAddClassroomModalOpen, closeModal, openModal } =
    useAddClassroomModal();
  const { isScanModalOpen, openScanBookModal, closeScanBookModal } =
    useScanBookModal();
  const { isTagModalOpen, openTagModal, closeTagModal } = useTagModal();
  const {
    isCreateCardsModalOpen,
    openCreateCardsModal,
    closeCreateCardsModal,
  } = useCreateCardsModal();
  const {
    isCheckoutBooksModalOpen,
    openCheckoutBooksModal,
    closeCheckoutBooksModal,
  } = useCheckoutBooksModal();
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
    getNewestBooks().then((books) => {
      setNewestBooks(books);
    });
    updateClassrooms();
    const minuteInterval = setInterval(() => {
      getNewestBooks().then((books) => {
        setNewestBooks(books);
      });
      updateClassrooms();
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
    let classroom_id = ID.unique();
    let DBStudents = await createStudentsDB(students, classroom_id);
    if (classroomExists) {
      console.log("Classroom already exists:", name);
      return;
    }
    let newClassroom = new Classroom(
      classroom_id,
      name,
      DBStudents,
      chosenBooks,
      color
    );
    createClassroomDB(newClassroom); // Update with returned classroom

    if (newClassroom) {
      // Update local state
      setClassrooms((prevClassrooms) => [...prevClassrooms, newClassroom]);

      getAvailableBooks();
      updateClassrooms();
    }
  };

  useEffect(() => {
    const fetchOverdueBooks = async () => {
      const overdueMap = {};
      for (const classroom of classrooms) {
        if (classroom.books && classroom.books.length > 0) {
          const overdueBooks = await getOverdueBooks(classroom);
          overdueMap[classroom.id] = overdueBooks.length;
        } else {
          overdueMap[classroom.id] = 0;
        }
      }
      setOverdueBooksMap(overdueMap);
    };

    fetchOverdueBooks();
  }, [classrooms]);

  const updateClassrooms = async () => {
    let fetchedClassrooms = await fetchClassrooms();
    let createdClassrooms = [];
    fetchedClassrooms.forEach((classroom) => {
      let newClassroom = new Classroom(
        classroom.$id,
        classroom.name,
        classroom.students,
        classroom.books,
        classroom.color
      );
      createdClassrooms.push(newClassroom);
    });
    setClassrooms(createdClassrooms);
  };
  return (
    <div className="dashboard_page_container">
      <div className="dashboard_title">Book Dream</div>
      <div className="dashboard_page_contents">
        <div className="classrooms_stats_container">
          {/* <div
            className="classrooms_stats_refresh_button"
            onClick={updateClassrooms}
          >
            Refresh
          </div> */}
          <div className="medium_title classroom_stats_title">Classrooms</div>
          <ClassroomList
            classrooms={classrooms}
            overdueBooksMap={overdueBooksMap}
            onClickClassroom={openCreateCardsModal}
            setSelectedClassroom={setSelectedClassroom}
            openCheckoutBooksModal={openCheckoutBooksModal}
          />
        </div>
        <div className="recent_books_container">
          <div className="medium_title">Recent Books</div>
          <div className="recent_books_content">
            {newestBooks.slice(0, 4).map((book, index) => {
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
          <div className="actions_tags action" onClick={openTagModal}>
            <FaTag className="center_icon" />
          </div>
        </div>
      </div>
      {isAddClassroomModalOpen && (
        <AddClassroomModal onSave={createClassroom} books={availableBooks} />
      )}
      {isScanModalOpen && <ScanModal />}
      {isTagModalOpen && <TagModal />}
      {isCreateCardsModalOpen && (
        <CreateCardsModal classroom={selectedClassroom} />
      )}
      {isCheckoutBooksModalOpen && (
        <CheckoutBooksModal classroom={selectedClassroom} />
      )}
    </div>
  );
}

export default DashboardPage;
