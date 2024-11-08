const StudentNameTag = ({ student, index, removeStudent }) => {
  return (
    <>
      <div
        className="student_name_tag_container"
        onClick={() => removeStudent(index)}
      >
        <p>{student}</p>
      </div>
    </>
  );
};

export default StudentNameTag;
