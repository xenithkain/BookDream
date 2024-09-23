import { useEffect, useState } from 'react'
import Tag from '../components/Tag'
import * as op from '../openlibrary/openlibrary'
import { useTagModal } from '../components/TagModalContext'
import TagModal from '../components/TagModal'

function TagsPage () {
  let [tags, setTags] = useState([])
  let [checkedTags, setCheckedTags] = useState([])
  let [checkedTagCount, setCheckedTagCount] = useState(0)
  let [selectMode, setSelectMode] = useState(false)
  const [startTime, setStartTime] = useState(null)

  let { isTagModalOpen, closeModal, openModal } = useTagModal()

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsString = await op.getTags() // Await the result of getTags
        const tagsArray = JSON.parse(tagsString) // Parse the JSON string
        setTags(tagsArray) // Set the state with the parsed tags
      } catch (error) {
        console.error('Error fetching tags:', error)
      }
    }

    fetchTags() // Call the async function inside useEffect
  }, [setTags, closeModal])

  const handleMouseDown = event => {
    event.stopPropagation()
    const currentTime = new Date().getTime()
    setStartTime(currentTime)
  }

  const handleMouseUp = event => {
    event.stopPropagation()
    if (startTime) {
      const currentTime = new Date().getTime()
      const duration = currentTime - startTime
      const durationSeconds = duration / 1000
      if (durationSeconds >= 0.5) {
        setSelectMode(true)
      }
      setStartTime(null)
    }
  }
  const handleCheckboxChange = name => {
    setCheckedTags(prevCheckedTags => {
      const newCheckedValue = !prevCheckedTags[name]
      if (newCheckedValue !== prevCheckedTags[name]) {
        return {
          ...prevCheckedTags,
          [name]: newCheckedValue
        }
      }
      return prevCheckedTags
    })
  }

  const onSave = async newTag => {
    try {
      // Add the new tag
      await op.addTag(newTag)

      const updatedTagsString = await op.getTags()
      const updatedTags = JSON.parse(updatedTagsString)
      setTags(updatedTags)

      closeModal() // Close the modal after saving
    } catch (error) {
      console.error('Error saving tag:', error)
    }
  }

  return (
    <>
      {isTagModalOpen && (
        <div className='ModalOverlay'>
          <TagModal onSave={onSave}></TagModal>
        </div>
      )}
      <button className='AddButton' onClick={openModal}>
        +
      </button>
      {tags.length > 0 ? (
        tags.map((tag, index) => {
          const tagName = Object.keys(tag)[0]
          const newTag = new Tag(
            tagName,
            tag[tagName].shape,
            tag[tagName].color,
            tag[tagName].description,
            handleMouseDown,
            handleMouseUp
          )
          return (
            <div key={index}>
              {selectMode ? (
                <input
                  type='checkbox'
                  checked={tags[tagName] || false}
                  onChange={() => handleCheckboxChange(tagName)}
                />
              ) : (
                <></>
              )}
              {newTag.returnHTML()}
            </div>
          )
        })
      ) : (
        <p>No tags available</p>
      )}
    </>
  )
}

export default TagsPage
