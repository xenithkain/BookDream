import { MdKeyboardArrowDown } from "react-icons/md";

const ClassroomList = ({ classrooms }) => {
  return (
    <>
      {classrooms.length > 0 ? (
        <div className="classroom_list_container">
          {classrooms.map((classroom, index) => {
            console.log(classroom);
            return (
              <div className="classroom_list_item" key={classroom.id}>
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
                  {classroom._available_books ? (
                    <p>Books: {classroom._available_books.length}</p>
                  ) : (
                    <p>Books: 0</p>
                  )}
                </div>
                <div className="classroom_list_overdue_indicator_container">
                  {classroom.overdue_books &&
                  classroom.overdue_books.length > 0 ? (
                    <>
                      <button className="classroom_list_overdue_dropdown">
                        <MdKeyboardArrowDown />
                      </button>
                      <p>{classroom.overdue_books.length} books overdue</p>
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
            );
          })}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default ClassroomList;
