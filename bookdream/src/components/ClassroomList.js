const ClassroomList = ({ classrooms }) => {
  return (
    <>
      {classrooms.length > 0 ? (
        <div className="classroom_list_container">
          {classrooms.map((classroom, index) => {
            return (
              <div className="classroom_list_item" key={classroom.id}>
                <div
                  className="classroom_list_item_divider"
                  style={{ backgroundColor: classroom.color }}
                ></div>
                <div className="classroom_list_item_content"></div>
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
