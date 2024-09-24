import Tag from "./Tag";
import { useTagModal } from "./TagModalContext";
import { useState } from "react";

function TagModal({ onSave }) {
  const shapeOptions = ["Flag", "Rect", "Oval"];

  const { closeModal, isTagModalOpen } = useTagModal();

  const [modalFields, setModalFields] = useState({
    name: "",
    description: "",
    shape: "",
    color: "",
  });

  const handleSave = () => {
    onSave(
      modalFields.name,
      modalFields.shape,
      modalFields.color,
      modalFields.description
    );
    closeModal();
  };

  const updateField = (field, value) => {
    setModalFields((prev) => ({ ...prev, [field]: value }));
  };

  if (!isTagModalOpen) return null;

  return (
    <div className="TagModal">
      <div className="TagModalContent">
        <h2>Create a New Tag</h2>

        {/* Input for Name */}
        <div className="TagFormGroup">
          <label htmlFor="TagName">Name</label>
          <input
            type="text"
            id="tag-name"
            value={modalFields.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        {/* Input for Description */}
        <div className="FormGroup">
          <label htmlFor="TagDescription">Description</label>
          <input
            type="text"
            id="tag-description"
            value={modalFields.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        {/* Dropdown for Shape */}
        <div className="FormGroup">
          <label htmlFor="TagShape">Shape</label>
          <select
            id="tag-shape"
            value={modalFields.shape}
            onChange={(e) => updateField("shape", e.target.value)}
          >
            {shapeOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Color Picker */}
        <div className="FormGroup">
          <label htmlFor="TagColor">Color</label>
          <input
            type="color"
            id="tag-color"
            value={modalFields.color}
            onChange={(e) => updateField("color", e.target.value)}
          />
        </div>

        {/* Save and Close Buttons */}
        <div className="FormButtons">
          <button onClick={handleSave}>Save</button>
          <button onClick={closeModal}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default TagModal;
