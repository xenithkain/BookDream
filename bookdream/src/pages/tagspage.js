import { useEffect, useReducer, useState } from "react";
import Tag from "../components/Tag";
import { getTags, addTag, removeTags } from "../appwrite/appwriteConfig";
import { useTagModal } from "../components/TagModalContext";
import TagModal from "../components/TagModal";

const initialState = {
  tags: [],
  checkedTags: {},
  checkedTagCount: 0,
  selectMode: false,
  startTime: null,
};

const tagReducer = (state, action) => {
  switch (action.type) {
    case "SET_TAGS":
      return { ...state, tags: action.payload };

    case "TOGGLE_TAG":
      const newCheckedTags = {
        ...state.checkedTags,
        [action.payload]: !state.checkedTags[action.payload],
      };
      const newCheckedTagCount =
        Object.values(newCheckedTags).filter(Boolean).length;
      return {
        ...state,
        checkedTags: newCheckedTags,
        checkedTagCount: newCheckedTagCount,
      };
    case "SET_SELECT_MODE":
      return { ...state, selectMode: action.payload };
    case "QUIT_SELECTION":
      return {
        ...state,
        selectMode: false,
        checkedTags: {},
        checkedTagCount: 0,
      };
    case "SET_START_TIME":
      return { ...state, startTime: action.payload };

    case "CLEAR_START_TIME":
      return { ...state, startTime: null };

    default:
      return state;
  }
};

function TagsPage() {
  let { isTagModalOpen, closeModal, openModal } = useTagModal();
  const [state, dispatch] = useReducer(tagReducer, initialState);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const fetchedTags = await getTags();
    dispatch({ type: "SET_TAGS", payload: fetchedTags });
  };

  const handleCheckboxChange = (name) => {
    dispatch({ type: "TOGGLE_TAG", payload: name });
  };

  const handleMouseDown = (event) => {
    event.stopPropagation();
    dispatch({ type: "SET_START_TIME", payload: new Date().getTime() });
  };

  const handleMouseUp = (event) => {
    event.stopPropagation();
    const { startTime } = state; // Destructure from state
    if (startTime) {
      const currentTime = new Date().getTime();
      const duration = currentTime - startTime;
      const durationSeconds = duration / 1000;
      if (durationSeconds >= 0.5) {
        dispatch({ type: "SET_SELECT_MODE", payload: true });
      }
      dispatch({ type: "CLEAR_START_TIME" });
    }
  };

  const onSave = async (name, shape, color, description) => {
    try {
      const newTag = {
        name: name,
        shape: shape || "Flag",
        color: color || "#000000",
        description: description || "No Description",
        textcolor: getContrastingTextColor(color),
      };

      // Save the new tag in the backend
      await addTag(newTag);

      // Update the tags using the reducer
      dispatch({ type: "SET_TAGS", payload: [...state.tags, newTag] });
    } catch (error) {
      console.error("Error saving tag:", error);
    }
  };

  const hexToRGB = (hex) => {
    if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
      console.warn("Invalid hex color:", hex);
      return { r: 0, g: 0, b: 0 };
    }

    const hexValue = hex.replace("#", "");
    const bigint = parseInt(hexValue, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return { r, g, b };
  };

  const handleQuitSelection = () => {
    dispatch({ type: "QUIT_SELECTION" });
  };

  const getContrastingTextColor = (hexColor) => {
    const { r, g, b } = hexToRGB(hexColor);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 128 ? "#000000" : "#ffffff";
  };

  const handleDelete = async () => {
    const selectedTags = Object.keys(state.checkedTags).filter(
      (tagName) => state.checkedTags[tagName]
    );
    await removeTags(selectedTags);
    const updatedTags = state.tags.filter(
      (tagObj) => !selectedTags.includes(tagObj.name)
    );
    dispatch({ type: "SET_TAGS", payload: updatedTags });
    handleQuitSelection();
  };

  return (
    <>
      {isTagModalOpen && (
        <div className="ModalOverlay">
          <TagModal onSave={onSave}></TagModal>
        </div>
      )}

      <button className="AddButton" onClick={openModal}>
        +
      </button>
      <div className="TagsContainer">
        {state.tags.length > 0 ? (
          state.tags.map((tagObj, index) => {
            const tagName = tagObj.name;
            return (
              <div key={index}>
                {state.selectMode ? (
                  <input
                    type="checkbox"
                    checked={state.checkedTags[tagName] || false}
                    onChange={() => {
                      handleCheckboxChange(tagName);
                    }}
                  />
                ) : (
                  <></>
                )}
                <Tag
                  name={tagName}
                  shape={tagObj.shape}
                  color={tagObj.color}
                  textcolor={tagObj.textcolor}
                  description={tagObj.description}
                  handleMouseDown={handleMouseDown}
                  handleMouseUp={handleMouseUp}
                />
              </div>
            );
          })
        ) : (
          <p>No tags available</p>
        )}
        {state.selectMode && state.checkedTagCount > 0 ? (
          <button className="DeleteButton" onClick={handleDelete}>
            Delete
          </button>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default TagsPage;
