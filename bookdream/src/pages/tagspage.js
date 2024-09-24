import { useEffect, useState } from "react";
import Tag from "../components/Tag";
import * as op from "../openlibrary/openlibrary";
import { useTagModal } from "../components/TagModalContext";
import TagModal from "../components/TagModal";

function TagsPage() {
  let [tags, setTags] = useState([]);
  let [checkedTags, setCheckedTags] = useState([]);
  let [checkedTagCount, setCheckedTagCount] = useState(0);
  let [selectMode, setSelectMode] = useState(false);
  const [startTime, setStartTime] = useState(null);

  let { isTagModalOpen, closeModal, openModal } = useTagModal();

  const fetchTags = async () => {
    try {
      const tagsString = await op.getTags();
      const tagsArray = JSON.parse(tagsString);
      if (Array.isArray(tagsArray)) {
        setTags(tagsArray); // Set the tags only if it's an array
      } else {
        console.error("Fetched tags are not an array:", tagsArray);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [setTags]);

  useEffect(() => {
    setCheckedTagCount(Object.values(checkedTags).filter(Boolean).length);
  }, [checkedTags]);

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
  const handleCheckboxChange = (name) => {
    setCheckedTags((prevCheckedTags) => {
      const newCheckedValue = !prevCheckedTags[name];
      if (newCheckedValue !== prevCheckedTags[name]) {
        return {
          ...prevCheckedTags,
          [name]: newCheckedValue,
        };
      }
      return prevCheckedTags;
    });
  };

  const onSave = async (name, shape, color, description) => {
    try {
      const colorToSave = color || "#000000";
      const shapeToSave = shape || "Flag";
      const nameToSave = name || "Blank";
      const descriptionToSave = description || "No Description";
      await op.addTag({
        [nameToSave]: {
          shape: shapeToSave,
          color: colorToSave,
          description: descriptionToSave,
          textcolor: getContrastingTextColor(color),
        },
      });

      // Fetch updated tags
      const updatedTagsString = await op.getTags();
      const updatedTags = JSON.parse(updatedTagsString);
      setTags(updatedTags); // Update state with new tags
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
    setSelectMode(false);
    setCheckedTagCount(0);
    setCheckedTags({});
  };

  const getContrastingTextColor = (hexColor) => {
    const { r, g, b } = hexToRGB(hexColor);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 128 ? "#000000" : "#ffffff";
  };

  const handleDelete = async () => {
    await op.removeTags(checkedTags);
    handleQuitSelection();
    fetchTags();
  };

  return (
    <>
      {isTagModalOpen && (
        <div className="ModalOverlay">
          <TagModal onSave={onSave}></TagModal>
        </div>
      )}
      {selectMode ? (
        <button className="SelectModeQuitButton" onClick={handleQuitSelection}>
          x
        </button>
      ) : (
        <></>
      )}
      <button className="AddButton" onClick={openModal}>
        +
      </button>
      <div className="TagsContainer">
        {tags.length > 0 ? (
          tags.map((tagObj, index) => {
            let tagName = Object.keys(tagObj)[0];
            let tag = tagObj[tagName];
            return (
              <div key={index}>
                {selectMode ? (
                  <input
                    type="checkbox"
                    checked={checkedTags[tagName] || false}
                    onChange={() => {
                      console.log(checkedTags);
                      handleCheckboxChange(tagName);
                    }}
                  />
                ) : (
                  <></>
                )}
                <Tag
                  name={tagName}
                  shape={tag.shape}
                  color={tag.color}
                  description={tag.description}
                  textcolor={tag.textcolor}
                  handleMouseDown={handleMouseDown}
                  handleMouseUp={handleMouseUp}
                />
              </div>
            );
          })
        ) : (
          <p>No tags available</p>
        )}
        {selectMode && checkedTagCount > 0 ? (
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
