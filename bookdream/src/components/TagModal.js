import Tag from './Tag'
import { useTagModal } from './TagModalContext'
import { cloneElement, useState } from 'react'

function TagModal ({ onSave }) {
  const { openModal, closeModal, isAdd, isTagModalOpen } = useTagModal()
  let [name, setName] = useState('')
  let [description, setDescription] = useState('')
  let [shape, setShape] = useState('')
  let [color, setColor] = useState('')

  let shapeOptions = ['Flag', 'Oval', 'Rect']

  const handleSave = () => {
    const newTag = new Tag(name, shape, color, description)
    onSave(newTag)
    closeModal()
  }

  if (!isTagModalOpen) return null

  return (
    <div className='TagModal'>
      <div className='TagModalContent'>
        <h2>Create a New Tag</h2>

        {/* Input for Name */}
        <div className='TagFormGroup'>
          <label htmlFor='TagName'>Name</label>
          <input
            type='text'
            id='tag-name'
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Input for Description */}
        <div className='FormGroup'>
          <label htmlFor='TagDescription'>Description</label>
          <input
            type='text'
            id='tag-description'
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Dropdown for Shape */}
        <div className='FormGroup'>
          <label htmlFor='TagShape'>Shape</label>
          <select
            id='tag-shape'
            value={shape}
            onChange={e => setShape(e.target.value)}
          >
            {shapeOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Color Picker */}
        <div className='FormGroup'>
          <label htmlFor='TagColor'>Color</label>
          <input
            type='color'
            id='tag-color'
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </div>

        {/* Save and Close Buttons */}
        <div className='FormButtons'>
          <button onClick={handleSave}>Save</button>
          <button onClick={closeModal}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default TagModal
