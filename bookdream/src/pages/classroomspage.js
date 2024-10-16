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
  const [selectMode, setSelectMode] = useState(false);
  const [checkedClassrooms, setCheckedClassrooms] = useState({});
  const [checkedCount, setCheckedCount] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    setCheckedCount(Object.values(checkedClassrooms).filter(Boolean).length);
  }, [checkedClassrooms]);

  const handleMouseDown = (event) => {
    event.stopPropagation();
    const currentTime = new Date().getTime();
    setStartTime(currentTime);
  };

  const handleMouseUp = (event) => {
    event.stopPropagation();
    if (startTime) {
      const currentTime = new Date().getTime();
      const duration = currentTime - startTime;
      const durationSeconds = duration / 1000;
      if (durationSeconds >= 0.5) {
        setSelectMode(true);
      }
      setStartTime(null);
    }
  };
  const handleAddClassroomClick = () => {
    openModal();
  };
  const handleCheckboxChange = (classroom) => {
    let id = classroom.id;
    setCheckedClassrooms((prevCheckedClassrooms) => {
      const newCheckedValue = !prevCheckedClassrooms[id];
      if (newCheckedValue !== prevCheckedClassrooms[id]) {
        // Check for change
        return {
          ...prevCheckedClassrooms,
          [id]: newCheckedValue,
        };
      }
      return prevCheckedClassrooms; // No change, return previous state
    });
  };
  const getAvailableBooks = async () => {
    const books = await fetchAvailableBooks();
    setAvailableBooks(books);
  };
  const getClassrooms = async () => {
    const c = await fetchClassrooms();
    console.log(c);
    setClassrooms(c);
  };
  useEffect(() => {
    getAvailableBooks();
    getClassrooms(); // Fetch classrooms on initial load
  }, []);

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

  const handleQuitSelection = () => {
    setSelectMode(false);
    setCheckedCount(0);
    setCheckedClassrooms({});
  };

  return (
    <>
      <button className="AddButton" onClick={handleAddClassroomClick}>
        +
      </button>
      {classrooms.length > 0 ? (
        <>
          {selectMode ? (
            <button
              className="SelectModeQuitButton"
              onClick={handleQuitSelection}
            >
              x
            </button>
          ) : (
            <></>
          )}
          {classrooms.map((classroom, index) => {
            console.log(classroom.id);
            return (
              <div
                key={classroom.id} // Ensure each classroom has a unique key
                className="ClassroomContainer"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                {selectMode ? (
                  <input
                    type="checkbox"
                    checked={checkedClassrooms[classroom.id] || false} // Bind checkbox to individual classroom
                    onChange={() => handleCheckboxChange(classroom)} // Handle the change for the specific classroom
                  />
                ) : null}
                <div className="ClassroomContent">
                  <p>{classroom.name}</p>
                  <p>Students: {classroom.students.length}</p>
                  <p>Books: {classroom.books.length}</p>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <></>
      )}
      {isAddClassroomModalOpen && (
        <AddClassroomModal onSave={createClassroom} books={availableBooks} />
      )}
    </>
  );
}

export default ClassroomsPage;
