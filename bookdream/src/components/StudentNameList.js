import StudentNameTag from "./StudentNameTag";

const StudentNameList = ({ students, setStudents }) => {
  const removeStudent = (index) => {
    setStudents(students.filter((_, i) => i !== index));
  };
  return (
    <>
      {students.map((student, index) => (
        <div key={index}>
          <StudentNameTag
            student={student}
            index={index}
            removeStudent={removeStudent}
          />
        </div>
      ))}
    </>
  );
};

export default StudentNameList;
