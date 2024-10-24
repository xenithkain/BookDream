const ClassroomList = ({ classrooms }) => {
  return (
    <>
      {classrooms.length > 0 ? (
        <div className="classroom_list_container">
          {classrooms.map((classroom, index) => {
            console.log(classroom.color);
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
                  {classroom.books ? (
                    <p>Books: {classroom.books.length}</p>
                  ) : (
                    <p>Books: 0</p>
                  )}
                </div>
                {}
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
