import React, { useState, useEffect, useRef, forwardRef } from "react";
import { useCreateCardsModal } from "../../contexts/CreateCardsModalContext";
import { FaXmark } from "react-icons/fa6";
import { ImCheckmark } from "react-icons/im";
import { HexColorPicker } from "react-colorful";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";
import { getStudents } from "../../appwrite/appwriteConfig";

export const ComponentToPrint = forwardRef(
  ({ classroom, background_color, text_color, useColor }, ref) => {
    const [students, setStudents] = useState([]);

    useEffect(() => {
      const fetchStudents = async () => {
        const fetchedStudents = await getStudents(classroom.students);
        setStudents(fetchedStudents);
      };

      fetchStudents();
    }, [classroom.students]);

    if (students.length === 0) {
      return <div>Loading...</div>; // Optionally show a loading state while fetching students
    }

    return (
      <div className="createcards_card_container" ref={ref}>
        {students.map((student) => (
          <div
            key={student.$id}
            className="student_card_container"
            style={
              useColor
                ? {
                    backgroundColor: `${background_color}`,
                    color: `${text_color}`,
                  }
                : {}
            }
          >
            <div className="student_card_name">{student.name}</div>
            <Barcode className="barcode" value={student.$id} />
          </div>
        ))}
      </div>
    );
  }
);

const CreateCardsModal = ({ classroom }) => {
  const componentRef = useRef(null);

  const printFn = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Cards",
  });

  const { closeCreateCardsModal, isCreateCardsModalOpen } =
    useCreateCardsModal();
  const [useColor, setUseColor] = useState(false);
  const [cardBackgroundColor, setCardBackgroundColor] = useState("");
  const [cardTextColor, setCardTextColor] = useState("");

  const handleSave = () => {
    closeCreateCardsModal();
  };

  if (!isCreateCardsModalOpen) return null;

  return (
    <>
      <div className="createcards_modal_screen_overlay">
        <div className="modal_actions">
          <div className="modal_accept_button" onClick={handleSave}>
            <ImCheckmark />
          </div>
          <div className="modal_cancel_button" onClick={closeCreateCardsModal}>
            <FaXmark />
          </div>
        </div>

        <div
          className="createcards_modal_container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="horizontal_alligner">
            <p style={{ fontSize: "var(--medium-font)" }}>Use Color: </p>
            <button
              className={`color_option_button ${useColor ? "active" : ""}`}
              onClick={() => setUseColor(true)}
            >
              Yes
            </button>
            <button
              className={`color_option_button ${!useColor ? "active" : ""}`}
              onClick={() => setUseColor(false)}
            >
              No
            </button>
          </div>

          {useColor ? (
            <div className="horizontal_alligner">
              <div
                className="vertical_alligner"
                style={{ margin: "var(--small-spacing)" }}
              >
                <label className="add_classroom_modal_label">
                  Background Color
                </label>
                <HexColorPicker
                  style={{ width: "100%" }}
                  color={cardBackgroundColor}
                  onChange={(color) => setCardBackgroundColor(color)}
                />
              </div>
              <div
                className="vertical_alligner"
                style={{ margin: "var(--small-spacing)" }}
              >
                <label className="add_classroom_modal_label">Text Color</label>
                <HexColorPicker
                  style={{ width: "100%" }}
                  color={cardTextColor}
                  onChange={(color) => setCardTextColor(color)}
                />
              </div>
            </div>
          ) : null}

          <button
            className="print_button color_option_button"
            onClick={printFn}
          >
            Print
          </button>

          <div style={{ display: "none" }}>
            <ComponentToPrint
              ref={componentRef}
              classroom={classroom}
              background_color={cardBackgroundColor}
              text_color={cardTextColor}
              useColor={useColor}
            ></ComponentToPrint>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCardsModal;
