import React, { useState, useEffect } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { getOverdueBooks } from "../appwrite/appwriteConfig";
import ClassroomOptionsDropdown from "./Dropdowns/ClassroomOptionsDropdown";

const ClassroomList = ({
  classrooms,
  overdueBooksMap,
  onClickClassroom,
  setSelectedClassroom,
  openCheckoutBooksModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {classrooms.length > 0 ? (
        <div className="classroom_list_container">
          {classrooms.map((classroom) => (
            <>
              <div
                className="classroom_list_item"
                key={classroom.id}
                onClick={() => {
                  setSelectedClassroom(classroom);
                  if (!isOpen) {
                    setIsOpen(true);
                  }
                }}
              >
                <ClassroomOptionsDropdown
                  openCreateCardsModal={onClickClassroom}
                  openCheckoutBooksModal={openCheckoutBooksModal}
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                />
                <div
                  className="classroom_list_item_divider"
                  style={{ backgroundColor: classroom.color }}
                ></div>
                <div className="classroom_list_item_content">
                  <p
                    style={{
                      fontSize: "var(--medium-font)",
                      fontWeight: "bold",
                    }}
                  >
                    {classroom.name}
                  </p>
                  <p style={{ fontSize: "var(--small2-font)" }}>
                    Students: {classroom.students.length}
                  </p>
                  {classroom.books ? (
                    <p>Books: {classroom.books.length}</p>
                  ) : (
                    <p>Books: 0</p>
                  )}
                </div>
                <div className="classroom_list_overdue_indicator_container">
                  {overdueBooksMap[classroom.id] > 0 ? (
                    <>
                      <button className="classroom_list_overdue_dropdown">
                        <MdKeyboardArrowDown />
                      </button>
                      <p>{overdueBooksMap[classroom.id]} books overdue</p>
                      <div
                        className="classroom_list_overdue_indicator_light"
                        style={{ backgroundColor: "red" }}
                      ></div>
                    </>
                  ) : (
                    <>
                      <p>No books overdue</p>
                      <div
                        className="classroom_list_overdue_indicator_light"
                        style={{ backgroundColor: "rgb(2, 178, 2)" }}
                      ></div>
                    </>
                  )}
                </div>
              </div>
            </>
          ))}
        </div>
      ) : (
        <p>No classrooms available</p>
      )}
    </>
  );
};

export default ClassroomList;
