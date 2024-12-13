import { useTagModal } from "../../contexts/TagModalContext";
import { FaXmark } from "react-icons/fa6";
import { ImCheckmark } from "react-icons/im";
import { useState, useEffect } from "react";
import {
  account,
  getTags,
  addTag,
  removeTag,
} from "../../appwrite/appwriteConfig";
import { HexColorPicker } from "react-colorful";
import Tag from "../Tag";
import TagsList from "../TagsList";

function TagModal() {
  const { isTagModalOpen, closeTagModal } = useTagModal();
  const [userDetails, setUserDetails] = useState();
  const [userTags, setUserTags] = useState([]);
  const [searchedTags, setSearchedTags] = useState([]);
  const [tagSearch, setTagSearch] = useState("");
  const [tagBackgroundColor, setTagBackgroundColor] = useState("");
  const [tagTextColor, setTagTextColor] = useState("");
  const [tagName, setTagName] = useState("");
  const [tagDescription, setTagDescription] = useState("");

  useEffect(() => {
    const getData = account.get();
    getData.then(
      (response) => {
        setUserDetails(response);
      },
      (error) => {
        console.error(error);
        console.log("There was an error");
      }
    );
    getTags().then((tags) => {
      setUserTags(tags);
    });
  }, []);

  const handleTagClick = (tag) => {
    setUserTags((prev) => {
      return prev.filter((prevtag) => {
        return prevtag.name != tag.name;
      });
    });
    removeTag(tag);
  };

  useEffect(() => {
    let filteredTags = userTags.filter((tag) => {
      let lowerName = tag.name.toLowerCase();
      return lowerName.includes(tagSearch.toLowerCase());
    });
    setSearchedTags(filteredTags);
  }, [tagSearch]);

  useEffect(() => {
    setTagDescription("");
    setTagName("");
    setTagBackgroundColor("");
    setTagTextColor("");
  }, [userTags]);
  const handleSave = () => {};
  if (!isTagModalOpen) return null;

  return (
    <>
      <div className="tag_modal_screen_overlay">
        <div className="modal_actions">
          <div className="modal_cancel_button" onClick={closeTagModal}>
            <FaXmark />
          </div>
        </div>
        <div
          onClick={(e) => e.stopPropagation()}
          className="tag_modal_container"
        >
          <div className="tag_modal_search_container">
            <label className="tag_modal_search_label">Name</label>
            <input
              className="tag_modal_text_input"
              type="text"
              value={tagSearch}
              placeholder="Search For Tag"
              onChange={(newName) => setTagSearch(newName.target.value)}
            ></input>
          </div>
          <p>Click To Remove Tags</p>
          <div className="tag_modal_searched_tags_container">
            {userTags.length > 0 ? (
              <TagsList
                tags={searchedTags.length > 0 ? searchedTags : userTags}
                setUserTags={setUserTags}
                handleClick={handleTagClick}
              />
            ) : (
              <></>
            )}
          </div>
          <div className="tag_modal_add_tag_container">
            <div className="horizontal_alligner">
              <div className="tag_modal_add_tag_name_container">
                <label className="tag_modal_search_label">Name</label>
                <input
                  className="tag_modal_text_input"
                  type="text"
                  value={tagName}
                  placeholder="Enter Tag Name"
                  onChange={(newName) => setTagName(newName.target.value)}
                ></input>
              </div>
              <div className="tag_modal_add_tag_description_container">
                <label className="tag_modal_search_label">Description</label>
                <input
                  className="tag_modal_text_input"
                  type="text"
                  value={tagDescription}
                  placeholder="Enter Tag Description"
                  onChange={(newName) =>
                    setTagDescription(newName.target.value)
                  }
                ></input>
              </div>
            </div>
            <div className="horizontal_alligner">
              <div className="tag_modal_add_tag_backgroundcolor_picker">
                <label className="add_classroom_modal_label">
                  Background Color
                </label>
                <HexColorPicker
                  style={{ width: "100%" }}
                  color={tagBackgroundColor}
                  onChange={(color) => setTagBackgroundColor(color)}
                />
              </div>
              <div className="tag_modal_add_tag_textcolor_picker">
                <label className="add_classroom_modal_label">Text Color</label>
                <HexColorPicker
                  style={{ width: "100%" }}
                  color={tagTextColor}
                  onChange={(color) => setTagTextColor(color)}
                />
              </div>
            </div>
            <div
              className="tag_modal_add_tag_add_button"
              onClick={() => {
                let tag = {
                  name: tagName != "" ? tagName : "Default Tag",
                  description:
                    tagDescription != "" ? tagDescription : "Default Tag",
                  background_color:
                    tagBackgroundColor != "" ? tagBackgroundColor : "#ffffff",
                  text_color: tagTextColor != "" ? tagTextColor : "#000000",
                };
                addTag(tag);
                setUserTags((prev) => [...prev, tag]);
              }}
            >
              Add
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TagModal;
